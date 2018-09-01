/*
-- As DB superuser

DROP TABLE IF EXISTS chain CASCADE;

CREATE TABLE chain (
	link1 text NOT NULL,
	link2 text NOT NULL, -- Space is used as an end-of-sentence sentinel
	n integer NOT NULL,
	PRIMARY KEY (link1, link2), -- Primary Key requires not null anyway
	CHECK (link1 <> ' ') 
);

CREATE TEMPORARY TABLE chain_tmp (
	id int,
	link1 text,
	link2 text,
	n integer
);

COPY chain_tmp(id,link1,link2,n) FROM '/home/znc/mysqldump/chain.txt';
INSERT INTO chain(link1, link2, n) SELECT link1, link2, SUM(n) FROM chain_tmp GROUP BY link1, link2;

DROP TABLE chain_tmp;

CREATE INDEX ON chain (link1);

GRANT ALL ON TABLE public.chain TO "maro-kun";
*/

--DROP FUNCTION weighted_next_word(text, double precision)
--DROP FUNCTION markov_chain(text, int);
--DROP FUNCTION record_sentence(text);

CREATE OR REPLACE FUNCTION weighted_next_word(word text, random double precision) RETURNS SETOF chain AS $SQL$
	-- Loosely based on https://stackoverflow.com/a/13040717
	SELECT link1, link2, n FROM (
		SELECT link1, link2, n,
		SUM(n) OVER (ORDER BY link1, link2) rank,
		SUM(n) OVER (ORDER BY link1) * random roll
		FROM chain
		WHERE link1 = word
	) t WHERE roll <= rank LIMIT 1
$SQL$ LANGUAGE SQL STABLE

-- Will not get inlined because random() is a volatile argument
--SELECT * FROM weighted_next_word('in', random())

CREATE OR REPLACE FUNCTION markov_chain(first_word text, word_limit int) RETURNS SETOF text AS $SQL$
	WITH RECURSIVE markov(link1, link2) AS ((
		SELECT chain.link1, chain.link2 FROM weighted_next_word(first_word, random()) chain
	) UNION ALL (
		SELECT chain.link1, chain.link2 FROM markov, weighted_next_word(markov.link2, random()) chain
	))

	SELECT link1 from markov LIMIT word_limit;
$SQL$ LANGUAGE SQL VOLATILE;

--SELECT string_agg(link1, ' ') FROM markov_chain('spam', 25) as tbl(link1);

CREATE OR REPLACE FUNCTION record_sentence(sentence text) RETURNS TABLE (link1 text, link2 text) AS $SQL$
	WITH
		words(words) AS (SELECT regexp_split_to_table(sentence, '[, ]+')),
		word_chain(link1, link2, n) AS (SELECT words, lead(words, 1) OVER (), 1 AS n FROM words)
	INSERT INTO chain(link1, link2, n)
	-- link2 would normally be null, but PK constraint disallows that
	SELECT link1, COALESCE(link2, ' ') AS link2, SUM(n) AS n FROM word_chain GROUP BY link1, link2
	ON CONFLICT (link1, link2) DO UPDATE SET n = chain.n + EXCLUDED.n -- Requires PG 9.5+
	RETURNING link1, link2;
$SQL$ LANGUAGE SQL VOLATILE;

--SELECT record_sentence('Also, I thought Maro-Kun was case-insensitive and I thought Maro-Kun ignored punctuation');

CREATE OR REPLACE FUNCTION build_sentence(seed1 text, seed2 text) RETURNS SETOF text AS $SQL$
	SELECT seed1
	UNION ALL
	SELECT markov.link1 FROM markov_chain(seed2, 25) as markov(link1)
$SQL$ LANGUAGE SQL VOLATILE

CREATE OR REPLACE FUNCTION record_and_return(sentence text, cue text) RETURNS SETOF text AS $SQL$
	-- Not as clean as the other ones, but it does the job, I guess.
	WITH recorded AS (SELECT link1, link2 FROM record_sentence(sentence) WHERE link2 <> ' ')
	SELECT build_sentence(t.link1, t.link2) FROM (
		SELECT link1, link2 FROM recorded
		WHERE EXISTS (SELECT 1 FROM recorded WHERE lower(link1) = lower(cue))
		ORDER BY random() LIMIT 1
	) t
$SQL$ LANGUAGE SQL VOLATILE

--SELECT * FROM record_and_return('Also, I thought it was case-insensitive and ignored punctuation', 'Maro-Kun');
--SELECT * FROM record_and_return('Also, I thought Maro-Kun was case-insensitive and ignored punctuation', 'Maro-Kun');


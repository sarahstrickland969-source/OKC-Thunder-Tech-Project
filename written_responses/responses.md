# Lineup analysis

I used the supplied possession data and the same aggregation as the `/api/v1/lineups` endpoint. Net rating is offensive points per 100 offensive possessions minus opponent points per 100 defensive possessions. A positive result means the lineup scored more efficiently than it allowed points. The question asks us to set aside sample size concerns.

## 1. Most positive 5-player lineup

**Tune Squad: Marvin the Martian, Foghorn Leghorn, Michael Jordan, Tweety, and Sylvester.** Its offensive rating is 200.0 and its defensive rating is 0.0, producing a **+200.0 net rating** across five total possessions. Several lineups tie at +200.0, so I broke the tie by total observed possessions; this lineup has the most among the tied groups. Its raw point differential is +6.

## 2. Most positive player

**Wasp (The Avengers).** Treating each player as a one-person lineup, Wasp has the highest net rating: **+54.5 points per 100 possessions**, across 24 total possessions. This measures team results while the player was on the floor. It does not isolate Wasp's individual contribution from teammates and opponents.

## 3. Counter to a large rebounding lineup

**The Avengers: Hawkeye, Dr. Strange, Wong, Captain Marvel, and Thor.** The group secured **1 of 1 offensive rebound opportunities (100%)** and **3 of 3 defensive rebound opportunities (100%)** in the provided possessions. Offensive rebounds give the team second chances after misses, while defensive rebounds end the opponent's possession and deny those second chances. It also posted a +100.0 net rating over ten total possessions. Among the lineups with 100% on both recorded rebound measures, this has the strongest net rating; the limited opportunities mean this is a data-based choice, not proof the lineup would reliably dominate a larger team.

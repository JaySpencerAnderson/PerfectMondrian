# PerfectMondrian
Perfect Solution to Mondrian Art Puzzle
#Mondrian Art Puzzle
The Mondrian Art Puzzle is a mathematical route of inquiry inspired by the
paintings of Piet Mondrian.  One such painting may be seen in the intro to
the Green Acres comedy series.

The Mondrian Art Puzzle aims to fill/populate a square with discrete
dimensions with a set of discretely sized rectangles, no two of which 
are congruent.  The score of the arrangment is calculated as the difference
between the areas of the largest and smallest rectangles.  There must be
at least 2 rectangles.

So for a minimal solution, if one starts with a 5x5 square, this can be 
divided into a 2x5 and a 3x5 rectangle, yielding a score of 15-10 = 5.

#Perfect Mondrian
A perfect solution to the Mondrian Art Puzzle is one that would have a
score of 0.

#Approach, Part 1
The first part of the approach is to come up with a schematic of rectangles
which have a chance of being sized so that all rectangles have the same area
and are not congruent.  The main part of this is that two adjacent rectangles
can not have common bounds on the two adjacent ends.  So in the case above
where the square is split *down the middle* into two rectangles, if the
rectangles had the same area, they would be congruent.

The first schematic which I came up with when pondering the problem resembles
a spiral, something like the following:

112
342
355

So 5 rectangles - one in the middle with the other four forming a sort of
pinwheel around the middle.

In fact, I've found this doesn't work for two reasons.  
1) When I size this using a spreadsheet, I find that the ratio of the dimensions
between the central square and the long or short dimension of the outer
rectangles goes to the golden ratio which is decidedly not rational.
2) When the size of the rectangles become the same, the outer rectangles
are congruent.

So perhaps I should have a second criterion for the schematics, that they are
not symmetric.  However that is not entirely obvious and there are different
sorts of symmetry.

#Approach, Part 2 (first thought)
My first thought on how to *solve* a schematic was to generate a set of
equally sized rectangles and try all of the combinations.  My thought was
to have the dimension of the square be N! where N is the number of rectangles
in the schematic.  The area of the rectangles would then be (N!xN!)/N.
Or maybe have the dimension of the square as some (large) multiple of N.

The problems with this approach are
1) The dimensions can get pretty big which could become unwieldly for 
Javascript or even for a language with 64 bit integers.
2) This isn't a very direct method.
3) If one set of rectangles failed to populate the schematic, one couldn't be
sure if the schematic or the set of rectangles had problems.

#Approach, Part 2 (second thought)
My current thought on how to *solve* a schematic is to guess one dimension
and then calulate the remaining dimensions, then adjusting the guess.

Let me illustrate with two examples.

#Example 1
111
244
233

The solution uses the equalities which I commented on earlier.  The solution
will have two rectangles which are congruent, but the purpose of this is to
illustrate how the solution is figured out.

0) Since there are 4 rectangles in the schematic, the width and height of the
square is set to 4! or 24.  Since there are 4 rectangles in the square, the
area of each rectangle is (24x24)/4 = 144.  We'll see this works out well.
1) Rectangle 1 is the width of the square or 24.  The height is 144/24 or 6.
2) Rectangle 2 is the height of the square minus 6 or 18.  The width is
144/18 or 8.
3) Rectangle 3 is the width of the square minus 8 or 16.  The width is 144/16
or 9.
4) Rectangle 4 could be calculated the same as Rectangle 3 - OR - the height
of rectangle 2 minus the height of rectangle 3 or 18 - 9 which is 9.  The
height is 144/9 or 16.

Rectangles 3 and 4 are congruent as was expected (since they are adjacent and
have the same width since they are both bounded by Rectangle 2 and the right
edge of the square.

##Double check:
We should be able to add the width of rectangles in 3 different ways and get
the width of the square (w(1)=24, w(2)+w(4)=24, w(2)+w(3)=24).  Similarly,
we can check the height of all of the squares.

##Disclaimer:
This example has no unknowns so works out pretty easily.

#Example 2
112
342
355

This is the spiral or pinwheel mentioned earlier.  We will have to start with
a guess since no rectangle dimension is known because none goes the full
width or height of the square - which is known.

This time I'll go with a width/height of 5! or 120 since there are 5 rectangles.
This will give each rectangle an area of (120x120)/5 or 2880.

1) The best guess would be any of the outer rectangles.  We know that the minimum
dimension for a rectangle the full width or height of the square is 120/5 or 24.
That means that the width of 1 has to be less than the full width minus the
minimum width or 120 - 24 or 96.  So we can make our first guess 96 for the 
width of rectangle 1.  This gives a height of 30.
Since this is clearly wrong when we calculate the dimensions of the next
rectangle, I'll just mention the calculations step by step and list the values
in a table afterwards since the guess is going to change.
2) width of 2 is 120 - width of 1.  Divide area by width to get height.
3) height of 3 is 120 - height of 1.  Divide area by height to get width.
4) width of 4 is 120 minus width of 3 and width of 2.
   height of 4 is height of 2 minus height of 1.
   We can now compare the resulting area of 4 to the expected area (2880) and
   adjust the width of 1 *down* to bring the area to the correct value.
5) width of 5 is 120 minus width of 3.
   The height of 5 can be calculated as 120 minus the height of 2 (5.ha) or
   120 minus the height of 1 and 4 (5.hb).

#Table:
1.w	1.h	2.w	2.h	3.w	3.h	4.w	4.h	4.a	5.w	5.ha	5.hb	5.aa	5.ab
96	30	24	120	32	90	64	90	5760	88	0	0	0	0
92	31..	28	102	32..	88..	59..	71..	4259	87..	17..	17..	1500	1500
88	32..	32	90	33	87..	55	57..	3150	87	30	30	2610	2610
86	33..	34	84..	33..	86..	52..	51..	2699..	86..	35..	35..	3060..	3060..
87	33	44	87	33	86	53	54	2917.4	86	32		2842.597403
86.9	33	33	87	33	86	53.7	53.8	2894.98	86.8	32.99		2865.0
86.8	33	33	86.7	33	86.8	53.6	53.5	2872.7	86.8	33.253		2887.29
86.81	33.1759	33.19	86.7731	33.1705	86.8240	53.6394	53.5972	2874.92	86.8294	33.2268		2885.0725
86.82	33.1720	33.18	86.7992	33.1690	86.8279	53.6509	53.6271	2877.14	86.8309	33.2007		2882.8502
86.83	33.1682	33.17	86.8254	33.1675	86.8317	53.6624	53.6571	2879.37	86.8324	33.1745		2880.62642
86.833	33.1671	33.167	86.8332	33.1671	86.8328	53.6658	53.6661	2880.04	86.8328	33.1667		2879.9590
86.8328	33.1671	33.1672	86.8327	33.1671	86.8328	53.6656	53.6655	2879.99	86.8328	33.1672		2880.0035
86.83281573	33.16718427			53.66563146	2880				2880

#Summary:
The process was to change the guess (1.w) until the areas (4.a, 5.aa, 5.ab) were correct, e.g. 2880.
I was doing this in a Google spreadsheet.
Note that the dimensions of 1, 2, 3 and 5 are identical when the areas get to 2880.  So this means this
 schematic results in congruent rectangles which disqualifies the result as a Mondrian solution.
Note that 4 is a square when the areas get to 2880.
Note that the ratio between the dimensions are the golden ratio:
- 86.83281573 / 53.66563146 = 1.618033989
- 53.66563146 / 33.16718427 = 1.618033989

The golden ratio is not rational.  This means we would not be able to multiply the width of the square by
some factor and come up with an integral solution.  This also disqualifies the result as a Mondrian solution.

This process did result in the area of all the rectangles resulting in the same expected value of 2880.

In summary, these two test examples did not result in a Perfect Mondrian solution to the puzzle.  However,
it looks like the method is sound and fairly direct.  The big question is whether the process will result
in rational dimensions.  I think I'm going to have to wait and see how that pans out.

Stay tuned.  I just got the store in the Mongo DB to work (again) today so now I think I can just work on 
implementing the procedure to solve.

Jay

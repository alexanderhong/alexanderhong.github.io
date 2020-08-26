---
title: MeshEdit
date: 2020-11-01 15:00
template: article.pug
banner: preview.png
---

Hello, this website is still under construction. Please check back later for more info.
<span class="more"></span>  

<h2 align="middle">Overview</h2>
<p>For the first part of the project, I implemented Bezier curves and surfaces through the de Casteljau algorithm so these elements could be correctly drawn in the provided rasterizer. In the second part of the project, the provided starter code had the ability to load DAE files, load information about the meshes according to the half-edge data structure, and draw meshes as triangles in 3D space. For these parts, I added the ability to view a model with Phong shading, flip edges, split edges, and subdivide the polygon mesh with the loop subdivision algorithm.</p>
<p>This project was interesting to me as a 2D and 3D artist since I use many of these tools (Bezier curves and mesh-editing tools) regularly for a wide variety of tasks. Working with the code behind these tools was a fascinating look at how algorithms and math translate to tools that can be used for art.</p>

<h2 align="middle">Section I: Bezier Curves and Surfaces</h2>

<h3 align="middle">Part 1: Bezier Curves with 1D de Casteljau Subdivision</h3>
<p>de Casteljau's algorithm represents a polynomial curve as a linear interpolation between control points over different points in time. With each step of the algorithm, for a given time <i>t</i>, the algorithm linearly interpolates between control points to produce intermediate control points, continuing to take steps until it reaches a single interpolated vector that represents the position on the curve for time <i>t</i>. This is implemented as a for loop through a vector of control points, which applies the lerp function to consecutive control points to output a vector of intermediate control points. This function is evaluated until the size of the output vector is 1 and the vector contains only the final point on the curve. The process is repeated for values of t between 0 and 1 to draw out the full curve.</p>

<p>I created a Bezier curve with 6 control points. The steps of the evaluation from the original control points to the final point can be seen below. The final curve is shown at the end.</p>
<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="images/img1-1.png" align="middle" width="300px"/>
      </td>
      <td>
        <img src="images/img1-2.png" align="middle" width="300px"/>
      </td>
      <td>
        <img src="images/img1-3.png" align="middle" width="300px"/>
      </td>
    </tr>
    <tr>
      <td>
        <img src="images/img1-4.png" align="middle" width="300px"/>
      </td>
      <td>
        <img src="images/img1-5.png" align="middle" width="300px"/>
      </td>
      <td>
        <img src="images/img1-6.png" align="middle" width="300px"/>
      </td>
    </tr>
    <tr>
      <td>
        <img src="images/img1-7.png" align="middle" width="300px"/>
      </td>
      <td>
        <img src="images/img1-8.png" align="middle" width="300px"/>
      </td>
    </tr>
  </table>
</div>

<p>I modified the curve slightly. Below is an animation showing the steps of evaluation for this curve from t=0 to t=1.</p>
<div align="middle">
  <img src="images/img1-9.gif" align="middle" width="600px"/>
  <figcaption align="middle">Caption</figcaption>
</div>
<!-- <div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="images/frames/curves (1).jpg" align="middle" width="300px"/>
      </td>
      <td>
        <img src="images/frames/curves (3).jpg" align="middle" width="300px"/>
      </td>
      <td>
        <img src="images/frames/curves (4).jpg" align="middle" width="300px"/>
      </td>
    </tr>
    <tr>
      <td>
      <img src="images/frames/curves (5).jpg" align="middle" width="300px"/>
      </td>
      <td>
      <img src="images/frames/curves (6).jpg" align="middle" width="300px"/>
      </td>
      <td>
      <img src="images/frames/curves (7).jpg" align="middle" width="300px"/>
      </td>
    </tr>
    <tr>
      <td>
      <img src="images/frames/curves (8).jpg" align="middle" width="300px"/>
      </td>
      <td>
      <img src="images/frames/curves (9).jpg" align="middle" width="300px"/>
      </td>
      <td>
      <img src="images/frames/curves (10).jpg" align="middle" width="300px"/>
      </td>
    </tr>
  </table>
</div> -->

<h3 align="middle">Part 2: Bezier Surfaces with Separable 1D de Casteljau</h3>
<p>Whereas a Bezier curve is defined as a linear sequence of control points, a Bezier surface is defined as a grid of control points. When evaluating a Bezier surface, we view the <i>n</i> x <i>m</i> grid as <i>n</i> three-dimensional Bezier curves, each with <i>m</i> control points. Rather than interpolating solely across a linear variable <i>t</i>, we now interpolate across the <i>u</i> direction and the <i>v</i> direction. After evaluating the location for each of the <i>n</i> Bezier curves with lerp parameter <i>u</i>, we use the resulting <i>n</i> points as control points for a new Bezier curve. We then interpolate across this new Bezier curve to find the final point on the Bezier surface.</p>
<div align="middle">
  <img src="images/img2-1.png" align="middle" width="600px"/>
  <figcaption align="middle">ez/teapot.bez</figcaption>
</div>b
<p></p>

<h2 align="middle">Section II: Triangle Meshes and Half-Edge Data Structure</h2>

<h3 align="middle">Part 3: Area-Weighted Vertex Normals</h3>
<p>I implemented area-weighted vertex normals for use in smoother Phong shading. In order to calculate the approximate unit normal for a vertex, I initialized an empty vector to hold the summed contribution from each face's normal and area. Calculating the area of a triangle requires the three vertices of the triangle. To traverse the surrounding triangles, I based my code on the provided example, which demonstrated how to traverse neighboring vertices. Since the vertices for neighboring triangles would be located in a loop around the center vertex, I used a diagram of the half-edge structure to process the triangles one at a time. </p>
<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="images/img3-1.png" align="middle" width="400px"/>
        <figcaption align="middle">Teapot without vertex normals</figcaption>
      </td>
      <td>
        <img src="images/img3-2.png" align="middle" width="400px"/>
        <figcaption align="middle">Teapot with vertex normals</figcaption>
      </td>
    </tr>
  </table>
</div>

<h3 align="middle">Part 4: Edge Flip</h3>
<p>I based my code for the edge flip operation from <a href="http://15462.courses.cs.cmu.edu/fall2015content/misc/HalfedgeEdgeOpImplementationGuide.pdf">this resource linked on the course website.</a> I named each half-edge, vertex, edge, and face according to the diagram, then updated the mappings for each half-edge, vertex, edge, and face based on the desired end-result for the flip.</p>

<div align="middle">
  <img src="images/img4-1.png" align="middle" width="400px"/>
  <figcaption align="middle"><i>Image courtesy CMU CS15-462</i></figcaption>
</div>

<p>Below is a comparison of a teapot before and after some edge flips</p>

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="images/img4-2.png" align="middle" width="400px"/>
        <figcaption align="middle">Before edge flips</figcaption>
      </td>
      <td>
        <img src="images/img4-3.png" align="middle" width="400px"/>
        <figcaption align="middle">After edge flips</figcaption>
      </td>
    </tr>
  </table>
</div>

<p>While working on the flip operation, I spent a short while trying to figure out why certain edges would disappear while flipping nearby edges. Ultimately, it turned out to be a typo when updating the neighbors for a certain half-edge.</p>

<h3 align="middle">Part 5: Edge Split</h3>
<p>Similar to the previous part, I based my code for the edge split operation from <a href="http://15462.courses.cs.cmu.edu/fall2015content/misc/HalfedgeEdgeOpImplementationGuide.pdf">this resource linked on the course website</a>, though less guidance was provided for edge splitting. I first drew a new diagram demonstrating my desired before and after for the edge split operation.</p>

<div align="middle">
  <img src="images/img5-1.png" align="middle" width="400px"/>
  <figcaption align="middle">Diagram of edge split operation</figcaption>
</div>

 <p>I named each half-edge, vertex, edge, and face according to the diagram, then updated the mappings for each half-edge, vertex, edge, and face based on the desired end-result for the split.</p>

<p>Below is a comparison of a teapot before and after some edge splits, and before and after a combination of both edge splits and edge flips.</p>

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="images/img5-2.png" align="middle" width="400px"/>
        <figcaption align="middle">Before edge splits</figcaption>
      </td>
      <td>
        <img src="images/img5-3.png" align="middle" width="400px"/>
        <figcaption align="middle">After edge splits</figcaption>
      </td>
    </tr>
    <tr>
      <td>
        <img src="images/img5-2.png" align="middle" width="400px"/>
        <figcaption align="middle">Before edge splits and flips</figcaption>
      </td>
      <td>
        <img src="images/img5-5.png" align="middle" width="400px"/>
        <figcaption align="middle">After edge splits and flips</figcaption>
      </td>
    </tr>
  </table>
</div>


<h3 align="middle">Part 6: Loop Subdivision for Mesh Upsampling</h3>
<p>I implemented loop subdivision in three phases. First, I looped through every vertex to pre-compute where it would be moved to after the subdivision, marking each vertex as an old vertex and saving the pre-computed values for each vertex. Similarly, I looped through each edge to pre-compute where the new vertices corresponding to each edge would be placed. Next, I performed the splitting operation on each edge, flipping any edges that were marked as new edges connecting a new vertex to an old vertex. Any new vertices produced by splitting received their position values from their associated edges. Finally, I updated the positions of all vertices according to their pre-computed position values. </p>

<p>Sharp corners and edges are rounded out as we subdivide meshes. Pre-splitting edges near corners helps to preserve their shape.</p>
<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="images/img6-1.png" align="middle" width="400px"/>
        <figcaption align="middle">Before loop subdivision</figcaption>
      </td>
      <td>
        <img src="images/img6-2.png" align="middle" width="400px"/>
        <figcaption align="middle">After loop subdivision</figcaption>
      </td>
    </tr>
    <tr>
      <td>
        <img src="images/img6-3.png" align="middle" width="400px"/>
        <figcaption align="middle">Before loop subdivision, pre-split edges</figcaption>
      </td>
      <td>
        <img src="images/img6-4.png" align="middle" width="400px"/>
        <figcaption align="middle">After loop subdivision, pre-split edges</figcaption>
      </td>
    </tr>
  </table>
</div>

<p>Subdividing the cube repeatedly causes the cube to become asymmetric, as shown below. Since the loop subdivision algorithm divides every triangle into four new ones, the orientation of those original triangles will affect how the mesh subdivides. When the mesh is asymmetrical, the adjacent corners of the cube have different triangles oriented around them, so their calculated position after subdividing will be different. Proprocessing the mesh by splitting edges and making the topology symmetric ensures that dividing the triangles will maintain the same topology.</p>

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="images/img6-5.png" align="middle" width="400px"/>
        <figcaption align="middle">Before loop subdivision</figcaption>
      </td>
      <td>
        <img src="images/img6-6.png" align="middle" width="400px"/>
        <figcaption align="middle">After loop subdivision</figcaption>
      </td>
    </tr>
    <tr>
      <td>
        <img src="images/img6-7.png" align="middle" width="400px"/>
        <figcaption align="middle">Before subdivision (symmetrical)</figcaption>
      </td>
      <td>
        <img src="images/img6-8.png" align="middle" width="400px"/>
        <figcaption align="middle">After subdivision (symmetrical)</figcaption>
      </td>
    </tr>
  </table>
</div>

---
title: Real-time watercolor shader
id: 1
template: article.pug
image: preview.png
---

A real-time watercolor shader coded in GLSL and Three.js.
<span class="more"></span>

The rendering pipeline is based on one devised by Luft and Deussen in a 2003 paper, with modifications to use the shaders in modern graphics system. I worked with Connie Chen and Cathy Lu on this project, with each of us contributing to the code and the design of the project.

I worked on the design of the rendering pipeline, wrote GLSL code for several render passes, optimized the code to avoid memory leaks and added support for rendering multiple objects from any OBJ file. The fruits demo was built with a generic OBJ file found freely available online, with our rendering pipeline applied. Click on it to interact with the object and move it around. It should work in most WebGL enabled browsers, but feel free to hit me up if it doesn't display properly.

<!-- <script type="module" src="js/full_pipeline.js"></script> -->
<script type="module" src="js/fruit.js"></script>

<script type="text/javascript" src="http://latex.codecogs.com/latexit.js"></script>

<h2 align="center">Full Pipeline Demo</h1>

<div id="full-pipeline_gui"></div>

<div align="center">
  <div id="full-pipeline"></div>
</div>

<div align="center">
  <div id="complex"></div>
</div>

For more information, visit the project website [here](https://c-chen99.github.io/watercolorShader/).

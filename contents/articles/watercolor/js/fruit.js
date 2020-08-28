import * as THREE from './build/three.module.js';
import { ColladaLoader } from './examples/jsm/loaders/ColladaLoader.js'
import { OBJLoader } from './examples/jsm/loaders/OBJLoader.js'
import { EffectComposer } from './examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './examples/jsm/postprocessing/ShaderPass.js';
import { VerticalBlurShader } from './examples/jsm/shaders/VerticalBlurShader.js';
import { HorizontalBlurShader } from './examples/jsm/shaders/HorizontalBlurShader.js';
import { CopyShader } from './examples/jsm/shaders/CopyShader.js';
import {OrbitControls} from './examples/jsm/controls/OrbitControls.js';

import { stepVertex, stepFragment, horizontalBlurVertex, horizontalBlurFragment, verticalBlurVertex, verticalBlurFragment } from './shaders/blur_shaders.js';
import { edgeVertex, edgeFragment } from './shaders/edge_darken_shaders.js';
import { texVertex, texFragment, paperFragment } from './shaders/texture_shaders.js';
import { bpVertex, bpFragment, diffuseFragment, specularFragment, addSpecularFragment, addDiffuseFragment } from './shaders/bp_shaders.js';
import { modVertex, modFragment } from './shaders/edge_modulation.js';
import { segVertex, segFragment, addFragment } from './shaders/seg_shader.js';

// import * as dat from '../dat.gui/dat.gui.module.js';


  var D, aspect, camera, height, light, loader, material, renderer, scene, width;

  var clock = new THREE.Clock();

  width = 960;
  height = 500;
  aspect = width / height;

  D = 8;

  scene = new THREE.Scene();
  // camera = new THREE.OrthographicCamera(-D * aspect, D * aspect, D, -D, 1, 1000);
  var camera = new THREE.PerspectiveCamera( 54, width/height, 0.1, 10000 );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(width, height);
	document.getElementById("complex").appendChild( renderer.domElement );
  material = new THREE.MeshBasicMaterial( { color: 0x000000 } );



	camera.position.set(226., 158., 254.)
  camera.lookAt(new THREE.Vector3( 0, 0, 0 ))
  camera.rotation.set(-30., 397., 0.)
	// camera.rotation.z = 1/6*Math.PI

  var container = document.getElementById('complex');
  var box = container.getBoundingClientRect();
  width = box.width
  height = 500
  renderer.setSize(width, height);
  camera.aspect = width/height
  camera.updateProjectionMatrix()

  var pointLight = new THREE.PointLight(0xffffff, 500.0);
  pointLight.position.set(1.5, 2, 2);
  scene.add(pointLight);

  var controls;
  function mouseControls() {
    controls = new OrbitControls( camera, renderer.domElement );
    // controls.addEventListener( 'change', render );
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
  }

  var intensityImage = new THREE.WebGLRenderTarget( width, height, parameters )
  var tempImage = new THREE.WebGLRenderTarget( width, height, parameters )
  var diffuseImage = new THREE.WebGLRenderTarget( width, height, parameters )
  var diffuseMaterial = new THREE.ShaderMaterial({
    uniforms: {
      baseColor: {type: 'vec3', value: new THREE.Color(0xff00ff)},
      k_diffuse: {type: 'f', value: 5.},
      p: {type: 'f', value: 50.},
      cameraPosition: {type: 'vec3', value: camera.position},
      lightPos: {type: 'vec3', value: pointLight.position},
      lightIntensity: {type: 'vec3', value: new THREE.Vector3().addScalar(pointLight.intensity)}
    },
    vertexShader: bpVertex(),
    fragmentShader: diffuseFragment()
  })
  var specularImage = new THREE.WebGLRenderTarget( width, height, parameters )
  var specularMaterial = new THREE.ShaderMaterial({
    uniforms: {
      baseColor: {type: 'vec3', value: new THREE.Color(0xffffff)},
      k_specular: {type: 'f', value: 5.},
      p: {type: 'f', value: 50.},
      cameraPosition: {type: 'vec3', value: camera.position},
      lightPos: {type: 'vec3', value: pointLight.position},
      lightIntensity: {type: 'vec3', value: new THREE.Vector3().addScalar(pointLight.intensity)}
    },
    vertexShader: bpVertex(),
    fragmentShader: specularFragment()
  })



  //paper texture: pigment granulation
  var paper = new THREE.TextureLoader().load('js/textures/paper.jpg')
  var paperTarget = new THREE.WebGLRenderTarget( width, height, parameters )
  paperTarget.texture = paper

  var addSpecularShader = {
    uniforms: {
      "intensity": {value: null},
      "specular": {value: specularImage},
      "k_s": {type: 'f', value: 0.5}
    },
    transparent: true,
    vertexShader: bpVertex(),
    fragmentShader: addSpecularFragment()
  }
  const addSpecularPass = new ShaderPass(addSpecularShader, "intensity")

  var addDiffuseShader = {
    uniforms: {
      intensity: {value: null},
      diffuse: {value: diffuseImage},
      color0: {type: 'vec3', value: new THREE.Color(0x008ad0)},
      color1: {type: 'vec3', value: new THREE.Color(0x123456)}
    },
    transparent: true,
    vertexShader: bpVertex(),
    fragmentShader: addDiffuseFragment()
  }
  var addDiffusePass = new ShaderPass(addDiffuseShader, "intensity")

  // blur pass
  var hShader = {
    uniforms: {
      tDiffuse: {value: null},
      h: {type: 'f', value: 1.0 / 800.0}
    },
    vertexShader: horizontalBlurVertex(),
    fragmentShader: horizontalBlurFragment()
  }
  var horizontalBlurPass = new ShaderPass(hShader)
  var vShader = {
    uniforms: {
      tDiffuse: {value: null},
      v: {type: 'f', value: 1.0 / 800.0}
    },
    vertexShader: verticalBlurVertex(),
    fragmentShader: verticalBlurFragment()
  }
  var verticalBlurPass = new ShaderPass(vShader)

  var stepShader = {
    uniforms: {
      "prev_out": { value: intensityImage },
      "k_p": {type: 'f', value: 0.43},
      "c_a": {type: 'f', value: 0.45}
    },
    transparent: true,
    vertexShader: stepVertex(),
    fragmentShader: stepFragment()
  };
  var stepPass = new ShaderPass(stepShader)

  // edge modulation
  var edgeModShader = {
    uniforms: {
      "prev_out": { value: null },
      k_delta: {type: 'f', value: 0.1},
      k_rho: {type: 'f', value: 0.6},
      k_theta: {type: 'f', value: 1.5},
      paper: {type: 't', value: paperTarget},
    },
    vertexShader: modVertex(),
    fragmentShader: modFragment()
  }
  var edgeModPass = new ShaderPass(edgeModShader, "prev_out")

  // edge darkening
  var edgeDarkenShader = {
    uniforms: {
      "intensity": {value: intensityImage },
      "prev_out": { value: null },
      k_omega: {type: 'f', value: 0.7}
    },
    vertexShader: edgeVertex(),
    fragmentShader: edgeFragment()
  }
  var edgeDarkenPass = new ShaderPass(edgeDarkenShader, "prev_out")

  // var paper = new THREE.TextureLoader().load('js/textures/paper.jpg')
  // var paperTarget = composer.readBuffer.clone()
  // paperTarget.texture = paper
  var paperShader = {
    uniforms: {
      prev_out: { value: null },
      paper: {type: 't', value: paperTarget},
      k_r: {type: 'f', value: 1.}
    },
    transparent: true,
    vertexShader: stepVertex(),
    fragmentShader: paperFragment()
  }
  paperShader.uniforms.paper.value.wrapS = paperShader.uniforms.paper.value.wrapT = THREE.RepeatWrapping
  var paperPass = new ShaderPass(paperShader, "prev_out")

  var renderPass = new RenderPass(scene, camera)
  renderPass.clear = true
  renderPass.clearAlpha = false
  renderPass.clearColor = true

  var segmentShader = {
    uniforms: {
      render: { type: 't', value: null },
      color: {type: 'vec4', value: new THREE.Vector4(0.0, 0.0, 0.0, 0.1)}
    },
    vertexShader: segVertex(),
    fragmentShader: segFragment()
  }

  var addShader = {
    uniforms: {
      render1: { type: 't', value: null },
      render2: { type: 't', value: null }
    },
    vertexShader: segVertex(),
    fragmentShader: addFragment()
  }

  var copyPass = new ShaderPass(CopyShader)
  copyPass.renderToScreen = false;

  var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false }
  var bufferTexture = new THREE.WebGLRenderTarget( width, height, parameters );

  function renderObject (composer, child, idColor, color0, color1, renderBuffer, delta) {
      // console.log(`Color of child is ${childColor.r}, ${childColor.g}, ${childColor.b}`)
      // segmentShader.uniforms.
      segmentShader.uniforms.color.value = idColor
      segmentShader.uniforms.render.value = bufferTexture
      let segPass = new ShaderPass(segmentShader)

      addDiffuseShader.uniforms.color0.value = color0
      addDiffuseShader.uniforms.color1.value = color1
      addDiffusePass = new ShaderPass(addDiffuseShader, "intensity")

      let maskPasses = [renderPass, segPass, copyPass]
      let intensityPasses = [addSpecularPass, addDiffusePass, horizontalBlurPass, verticalBlurPass, edgeModPass, copyPass]
      let diffusePasses = [renderPass, copyPass]
      let specularPasses = [renderPass, copyPass]
      let additionalPasses = [stepPass, edgeDarkenPass, paperPass, copyPass]

      let backup = child.material
      composer.passes = diffusePasses

      child.material = diffuseMaterial
      composer.readBuffer  = diffuseImage
      composer.render(delta)
      composer.reset()

      composer.passes = specularPasses

      child.material = specularMaterial
      composer.readBuffer = specularImage
      composer.render(delta)
      composer.reset()

      child.material = backup
      composer.passes = maskPasses.concat(intensityPasses)
      composer.writeBuffer = intensityImage
      composer.render(delta)
      composer.reset()

      composer.passes = additionalPasses
      // composer.passes = [testPass]
      composer.writeBuffer = renderBuffer
      composer.render(delta);
      composer.reset();
  }

  function main (loaded) {
    loaded.scale.set(0.043, 0.043, 0.043)
    scene.add(loaded)

    let i = 0
    const idToColor = {}
    const children = []
    scene.traverse( function ( child ) {
       if ( child.isMesh ) {
         const id = i
         const color = new THREE.Color(Math.random() * 0xffffff)
         child.material =  new THREE.MeshBasicMaterial( { color: color} );
         idToColor[id] = color
         children.push(child)
         i++
       }
    } );

    let renderBuffer1 = new THREE.WebGLRenderTarget( width, height, parameters )
    let renderBuffer2 = new THREE.WebGLRenderTarget( width, height, parameters )

    // order: pear, green apple, stem?, grapes, bowl, green apples, red apple, leaf
    let colors0 = [new THREE.Color(0x91691f), // pear
                    new THREE.Color(0x006b07),  // green apples
                    new THREE.Color(0x360a0a), // stem
                    new THREE.Color(0x2f2b4d), // grapes
                    new THREE.Color(0x4d4229), // bowl
                    new THREE.Color(0x006b07),  // green apples
                    new THREE.Color(0x612020), // red apple
                    new THREE.Color(0x003b14),  // leaf
                  ]
    let colors1 = [new THREE.Color(0x5e4516), // pear
                    new THREE.Color(0x004d05), // green apples
                    new THREE.Color(0x000000), // stem
                    new THREE.Color(0x070036), // grapes
                    new THREE.Color(0x000000), // bowl
                    new THREE.Color(0x004d05), // green apples
                    new THREE.Color(0x4d0000), // red apples
                    new THREE.Color(0x00240c),  // leaf
                  ]


    var animate = function () {
      // scene.rotation.x += 0.03;
      // scene.rotation.y += 0.03;
      requestAnimationFrame( animate );
      controls.update();

      let oldTarget = renderer.getRenderTarget()


      renderer.setRenderTarget(bufferTexture)


      var container = document.getElementById('complex');
      var box = container.getBoundingClientRect();
      width = box.width
      height = 500
      renderer.setSize(width, height);
      camera.aspect = width/height
      camera.updateProjectionMatrix()


      var delta = clock.getDelta();
      renderer.render(scene, camera)

      renderer.setRenderTarget(oldTarget)

      let childColor = idToColor[0]
      let child = children[0]

      let composer = new EffectComposer(renderer)
      composer.setSize(width, height)

      renderObject(composer, child, childColor, colors0[0], colors1[0], renderBuffer1, delta)

      for (let j = 1; j < 8; j++) {
        childColor = idToColor[j]
        child = children[j]
        renderObject(composer, child, childColor, colors0[j], colors1[j], renderBuffer2, delta)
        // renderObject(composer, child, childColor, colors0[0], colors1[0], renderBuffer2)

        addShader.uniforms.render1.value = renderBuffer2
        addShader.uniforms.render2.value = renderBuffer1
        let addPass = new ShaderPass(addShader)
        composer.passes = [addPass, copyPass]
        let tempBuffer = new THREE.WebGLRenderTarget( width, height, parameters )
        composer.writeBuffer = tempBuffer
        composer.render()
        composer.reset()

        renderBuffer1.dispose()
        renderBuffer1 = tempBuffer
        renderBuffer2.dispose()
      }
      renderBuffer1.dispose()
      renderBuffer2.dispose()
    }
    // initGui();
    mouseControls();
    animate();
  }

  loader = new OBJLoader();
  loader.load('fruits_small.obj', main);

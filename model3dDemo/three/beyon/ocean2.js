var Ocean2 =
{
	ms_Renderer: null,
	ms_Camera: null,
	ms_Scene: null,
	ms_Controls: null,
	ms_Ocean: null,
	lastTime : (new Date()).getTime(),
	Initialize: function () {

		// this.ms_Renderer = new THREE.WebGLRenderer();
		this.ms_Renderer.setPixelRatio( window.devicePixelRatio );
		this.ms_Renderer.context.getExtension('OES_texture_float');
		this.ms_Renderer.context.getExtension('OES_texture_float_linear');

		// document.body.appendChild(this.ms_Renderer.domElement);

		// this.ms_Scene = new THREE.Scene();

		// this.ms_Camera = new THREE.PerspectiveCamera(55.0, window.innerWidth / window.innerHeight, 0.5, 300000);
		// this.ms_Camera.position.set(450, 350, 450);
		// this.ms_Camera.lookAt(new THREE.Vector3());

		// Initialize Orbit control
		// this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
		// this.ms_Controls.userPan = false;
		// this.ms_Controls.userPanSpeed = 0.0;
		// this.ms_Controls.minDistance = 0;
		// this.ms_Controls.maxDistance = 2000.0;
		// this.ms_Controls.minPolarAngle = 0;
		// this.ms_Controls.maxPolarAngle = Math.PI * 0.495;
		var hash = 'half-float';
		var gsize = 512;
		var res = 1024;
		var gres = res / 2;
		var origx = -gsize / 2;
		var origz = -gsize / 2;
		this.ms_Ocean = new THREE.Ocean(this.ms_Renderer, this.ms_Camera, this.ms_Scene,
		{
			USE_HALF_FLOAT : hash === 'half-float',
			INITIAL_SIZE : 256.0,
			INITIAL_WIND : [10.0, 10.0],
			INITIAL_CHOPPINESS : 1.5,
			CLEAR_COLOR : [1.0, 1.0, 1.0, 0.0],
			GEOMETRY_ORIGIN : [origx, origz],
			SUN_DIRECTION : [-1.0, 1.0, 1.0],
			OCEAN_COLOR: new THREE.Vector3(0.004, 0.016, 0.047),
			SKY_COLOR: new THREE.Vector3(3.2, 9.6, 12.8),
			EXPOSURE : 0.35,
			GEOMETRY_RESOLUTION: gres,
			GEOMETRY_SIZE : gsize,
			RESOLUTION : res
		});
		this.ms_Ocean.materialOcean.uniforms.u_projectionMatrix = { value: this.ms_Camera.projectionMatrix };
		this.ms_Ocean.materialOcean.uniforms.u_viewMatrix = { value: this.ms_Camera.matrixWorldInverse };
		this.ms_Ocean.materialOcean.uniforms.u_cameraPosition = { value: this.ms_Camera.position };
		this.ms_Scene.add(this.ms_Ocean.oceanMesh);
		// this.ms_Ocean.choppiness = 1;
		// this.ms_Ocean.windX = 10;
		// this.ms_Ocean.windY = 10;
		// this.ms_Ocean.sunDirectionX = -1;
		// this.ms_Ocean.sunDirectionY = 1;
		// this.ms_Ocean.sunDirectionZ = 1;
		// this.ms_Ocean.exposure = 0.25;
		// this.ms_Ocean.size = 0.35;
	},

	Display: function (me) {
		me.ms_Renderer.render(me.ms_Scene, me.ms_Camera);
	},

	Update: function (me) {
		var currentTime = new Date().getTime();
		me.ms_Ocean.deltaTime = (currentTime - me.lastTime) / 1000 || 0.0;
		me.lastTime = currentTime;
		me.ms_Ocean.render(me.ms_Ocean.deltaTime);
		me.ms_Ocean.overrideMaterial = me.ms_Ocean.materialOcean;
		if (me.ms_Ocean.changed) {
			me.ms_Ocean.materialOcean.uniforms.u_size.value = me.ms_Ocean.size;
			me.ms_Ocean.materialOcean.uniforms.u_sunDirection.value.set( me.ms_Ocean.sunDirectionX, me.ms_Ocean.sunDirectionY, me.ms_Ocean.sunDirectionZ );
			me.ms_Ocean.materialOcean.uniforms.u_exposure.value = me.ms_Ocean.exposure;
			me.ms_Ocean.changed = false;
		}
		me.ms_Ocean.materialOcean.uniforms.u_normalMap.value = me.ms_Ocean.normalMapFramebuffer.texture;
		me.ms_Ocean.materialOcean.uniforms.u_displacementMap.value = me.ms_Ocean.displacementMapFramebuffer.texture;
		me.ms_Ocean.materialOcean.uniforms.u_projectionMatrix.value = me.ms_Camera.projectionMatrix;
		me.ms_Ocean.materialOcean.uniforms.u_viewMatrix.value = me.ms_Camera.matrixWorldInverse;
		me.ms_Ocean.materialOcean.uniforms.u_cameraPosition.value = me.ms_Camera.position;
		me.ms_Ocean.materialOcean.depthTest = true;
		// me.ms_Scene.__lights[1].position.x = me.ms_Scene.__lights[1].position.x + 0.01;
		me.Display(me);
	},

	Resize: function (inWidth, inHeight) {
		this.ms_Camera.aspect = inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.Display(this);
	}
};
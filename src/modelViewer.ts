import { Mesh, NearestFilter, LinearFilter, Vector2, BoxGeometry, Color, MeshBasicMaterial, Group, MeshLambertMaterial, TextureLoader, Object3D, OrthographicCamera, PerspectiveCamera, Scene, AmbientLight, DirectionalLight, WebGLRenderer, Geometry, LineBasicMaterial, Vector3, LineSegments,  } from "three";
import { OrbitControls } from 'three-orbitcontrols-ts';

declare global {
    interface Window {
        children:any[];
        displayOptions:any[];
        animationLoop: boolean | undefined;
    }
}

export function ModelViewer(this: any, container: any, isOrtho = false, width = 400, height = 400) {
    this.element = container;

    this.camera = isOrtho ? new OrthographicCamera(20 / -2, 20 / 2, 20 / 2, 20 / -2, 1, 1000) : new PerspectiveCamera(60, 1, 1, 1000);
    this.camera.position.x = 16;
    this.camera.position.y = 16;
    this.camera.position.z = 32;

    this.scene = new Scene();

    let ambientLight = new AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);
    let dirLight = new DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(4, 10, 6);
    this.scene.add(dirLight);

    this.renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.2;
    this.controls.zoomSpeed = 1.4;
    this.controls.rotateSpeed = 0.6;
    this.controls.autoRotate = !isOrtho;
    this.controls.enableKeys = false;
    this.controls.addEventListener('start', () => this.element.style.cursor = "grabbing");
    this.controls.addEventListener('end', () => this.element.style.cursor = "grab");

    this.element.appendChild(this.renderer.domElement);

    let self = this as any;

    this.draw = () => self.renderer.render(self.scene, self.camera);

    this.animate = () => {
        window.requestAnimationFrame(self.animate);
        self.controls.update();
        self.draw();
        console.log(this.camera.rotation);
        console.log(this.camera.position);
    };

    this.resize = () => {
        let rect = self.element.getBoundingClientRect();
        self.camera.aspect = rect.width / rect.height;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize(rect.width, rect.height);
    };

    this.models = {};

    self = this;

    this.load = (model: any) => {
        let name = model.modelName;
        if (Object.keys(self.models).indexOf(name) >= 0)
            throw new Error('Model "' + name + '" is already loaded.');
        self.scene.add(model);
        self.models[name] = model;
        return self;
    };

    this.get = (name: string) => {
        if (!(Object.keys(self.models).indexOf(name) >= 0))
            throw new Error('Model "' + name + '" is not loaded.');
        return self.models[name];
    };

    this.getAll = () => Object.keys(self.models).map((name) => self.models[name]);

    this.remove = (name: string) => {
        if (!(Object.keys(self.models).indexOf(name) >= 0))
            throw new Error('Model "' + name + '" is not loaded.');
        delete self.models[name];
        for (let i = 0; i < self.scene.children.length; i++) {
            if (self.scene.children[i] instanceof JsonModel && self.scene.children[i].modelName == name) {
                self.scene.children[i].animationLoop = false;
                self.scene.remove(self.scene.children[i]);
                break;
            }
        }
        return self;
    };

    this.removeAll = () => {
        for (let i = self.scene.children.length - 1; i >= 0; i--) {
            if (self.scene.children[i] instanceof JsonModel) {
                self.scene.children[i].animationLoop = false;
                self.scene.remove(self.scene.children[i]);
            }
        }
        self.models = {};
        return self;
    };

    this.hide = (name: string) => {
        if (!(Object.keys(self.models).indexOf(name) >= 0))
            throw new Error('Model "' + name + '" is not loaded.');
        self.models[name].visible = false;
        self.draw();
    };

    this.hideAll = () => {
        Object.keys(self.models).forEach((name) => {
            self.models[name].visible = false;
        });
        return self;
    };

    this.show = (name: string) => {
        if (!(Object.keys(self.models).indexOf(name) >= 0))
            throw new Error('Model "' + name + '" is not loaded.');
        self.models[name].visible = true;
        self.draw();
    };

    this.showAll = () => {
        Object.keys(self.models).forEach((name) => {
            self.models[name].visible = true;
        });
        return self;
    }

    this.reset = () => self.controls.reset();

    this.lookAt = (name: string) => {
        let model = self.get(name);
        self.controls.target = model.getCenter();
    };

    let gridGeometry = new Geometry();
    let gridMaterial = new LineBasicMaterial({
        color: 0xafafaf
    });
    for (let i = -8; i <= 8; i++) {
        gridGeometry.vertices.push(new Vector3(-8, -8, i));
        gridGeometry.vertices.push(new Vector3(8, -8, i));
        gridGeometry.vertices.push(new Vector3(i, -8, -8));
        gridGeometry.vertices.push(new Vector3(i, -8, 8));
    }

    gridGeometry.vertices.push(new Vector3(-1, -8, 9));
    gridGeometry.vertices.push(new Vector3(1, -8, 9));
    gridGeometry.vertices.push(new Vector3(1, -8, 9));
    gridGeometry.vertices.push(new Vector3(0, -8, 10));
    gridGeometry.vertices.push(new Vector3(0, -8, 10));
    gridGeometry.vertices.push(new Vector3(-1, -8, 9));
    let grid = new LineSegments(gridGeometry, gridMaterial);
    grid.visible = !isOrtho;
    this.scene.add(grid);
    this.grid = grid;

    self = this;

    this.showGrid = () => self.grid.visible = true;

    this.hideGrid = () => self.grid.visible = false;

    this.setGridColor = (color: string | number | Color | undefined) => self.grid.material.color = new Color(color);

    this.toImage = async () => {
        await sleep(100);
        return this.renderer.domElement.toDataURL()
    };

    this.animate();
}

export function JsonModel(this: any, name: string, model: any, texturesReference: any, clipUVs: boolean) {

    if (clipUVs === undefined) clipUVs = true;

    Object3D.call(this);

    this.modelName = name;
    this.animationLoop = true;

    let textures: any = {};
    let references: string[] = [];
    let animated: number[] = [];
    let animations: any[] = [];
    if (model.hasOwnProperty('textures')) {

        Object.keys(model.textures).forEach((key, index) => {
            let temp = model.textures[key].split('/');
            let textureName = temp[temp.length - 1];
            let reference;

            for (let i = 0; i < texturesReference.length; i++) {
                reference = texturesReference[i];
                if (reference.name == textureName) break;
            }

            if (reference.name == textureName) {
                references.push(key);
                if (reference.hasOwnProperty('mcmeta')) {
                    let mcmeta;
                    try {
                        mcmeta = JSON.parse(reference.mcmeta);
                    } catch (e) {
                        throw new Error('Couldn\'t parse mcmeta for texture "' + textureName + '". ' + e.message + '.');
                    }
                    if (!mcmeta.hasOwnProperty('animation'))
                        throw new Error('Couldn\'t find the "animation" property in mcmeta for texture "' + textureName + '"');
                    let imageBuffer = new Image();
                    imageBuffer.src = reference.texture;
                    let width = imageBuffer.width;
                    let height = imageBuffer.height;
                    if (height % width != 0)
                        throw new Error('Image dimensions are invalid for texture "' + textureName + '".');
                    let frames = [];
                    if (mcmeta.animation.hasOwnProperty('frames')) {
                        frames = mcmeta.animation.frames;
                    } else {
                        for (let k = 0; k < height / width; k++) {
                            frames.push(k);
                        }
                    }
                    let frametime = mcmeta.animation.frametime || 1;
                    let animation = [];
                    for (let i = 0; i < frames.length; i++) {
                        let frame = frames[i];
                        if (typeof frame == 'number') {
                            animation.push({
                                index: frame,
                                time: frametime
                            })
                        } else {
                            if (!frame.hasOwnProperty('index'))
                                throw new Error('Invalid animation frame at index "' + i + '" in mcmeta for texture "' + textureName + '".');
                            animation.push({
                                index: frame.index,
                                time: frame.time || frametime
                            });
                        }
                    }
                    let numberOfImages = height / width;
                    animations.push({
                        height: numberOfImages,
                        frames: animation,
                        currentFrame: 0
                    });
                    animated.push(references.length - 1);
                    let images = [];
                    for (let i = 0; i < height / width; i++) {
                        let canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = width;
                        let ctx = canvas.getContext('2d');
                        ctx!.drawImage(imageBuffer, 0, -i * width);
                        images.push(canvas.toDataURL('image/png'));
                    }
                    textures[key] = images;
                } else {
                    textures[key] = reference.texture;
                }
            } else {
                throw new Error('Couldn\'t find matching texture for texture reference "' + textureName + '".');
            }
        })
    } else {
        throw new Error('Couldn\'t find "textures" property.');
    }

    self = this;

    let materials = [];
    references.forEach((ref, index) => {
        let image = textures[ref] instanceof Array ? textures[ref][0] : textures[ref];
        let loader = new TextureLoader();
        let texture = loader.load(image);
        texture.magFilter = NearestFilter;
        texture.minFilter = LinearFilter;
        let mat = new MeshLambertMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5
        });
        materials.push(mat);
        if (textures[ref] instanceof Array) {
            let images = textures[ref];
            let animation = animations[animated.indexOf(index)];
            ((material, images, animation) => {
                let animateTexture = () => {
                    let frame = animation.frames[animation.currentFrame]
                    try {
                        material.map!.image.src = images[frame.index]
                        animation.currentFrame = animation.currentFrame < animation.frames.length - 1 ? animation.currentFrame + 1 : 0
                    } catch (e) {
                        console.log(e.message)
                    }
                    window.setTimeout(() => {
                        if (self.animationLoop)
                            window.requestAnimationFrame(animateTexture)
                    }, frame.time * 50)
                }
                window.requestAnimationFrame(animateTexture)
            })(mat, images, animation)
        }
    })
    let transparentMaterial = new MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        alphaTest: 0.5
    });
    materials.push(transparentMaterial);
    let material = materials;


    let elements;
    if (model.hasOwnProperty('elements')) {
        elements = model.elements;
    } else {
        throw new Error('Couldn\'t find "elements" property')
    }

    let group = new Group()
    elements.forEach((element: { [x: string]: any[]; hasOwnProperty: any; faces: any; rotation: any; }, index: string) => {

        if (!element.hasOwnProperty('from'))
            throw new Error('Couldn\'t find "from" property for element "' + index + '".')
        if (!(element['from'].length == 3))
            throw new Error('"from" property for element "' + index + '" is invalid.')
        if (!element.hasOwnProperty('to'))
            throw new Error('Couldn\'t find "to" property for element "' + index + '".')
        if (!(element['to'].length == 3))
            throw new Error('"to" property for element "' + index + '" is invalid.')
        for (let i = 0; i < 3; i++) {
            let f = element['from'][i]
            let t = element['to'][i]
            if (typeof f != 'number' || f < -16)
                throw new Error('"from" property for element "' + index + '" is invalid (got "' + f + '" for coordinate "' + ['x', 'y', 'z'][i] + '").')
            if (typeof t != 'number' || t > 32)
                throw new Error('"to" property for element "' + index + '" is invalid (got "' + t + '" for coordinate "' + ['x', 'y', 'z'][i] + '").')
            if (t - f < 0)
                throw new Error('"from" property is bigger than "to" property for coordinate "' + ['x', 'y', 'z'][i] + '" in element "' + index + '".')
        }

        let width = element['to'][0] - element['from'][0]
        let height = element['to'][1] - element['from'][1]
        let length = element['to'][2] - element['from'][2]
        let origin = {
            x: (element['to'][0] + element['from'][0]) / 2 - 8,
            y: (element['to'][1] + element['from'][1]) / 2 - 8,
            z: (element['to'][2] + element['from'][2]) / 2 - 8
        }

        let fix = 0.001
        let geometry = new BoxGeometry(width + fix, height + fix, length + fix)
        geometry.faceVertexUvs[0] = []

        if (element.hasOwnProperty('faces')) {
            let faces = ['east', 'west', 'up', 'down', 'south', 'north']
            for (let i = 0; i < 6; i++) {
                let face = faces[i]
                if (element.faces.hasOwnProperty(face)) {

                    if (!element.faces[face].hasOwnProperty('texture'))
                        throw new Error('Couldn\'t find "texture" property for "' + face + '" face in element "' + index + '".')
                    if (!element.faces[face].hasOwnProperty('uv'))
                        throw new Error('Couldn\'t find "uv" property for "' + face + '" face in element "' + index + '".')
                    if (element.faces[face].uv.length != 4)
                        throw new Error('The "uv" property for "' + face + '" face in element "' + index + '" is invalid (got "' + element.faces[face].uv + '").')

                    let ref = element.faces[face].texture
                    let textureIndex = references.indexOf(ref[0] == '#' ? ref.substring(1) : ref)

                    if (textureIndex < 0)
                        throw new Error('The "texture" property for "' + face + '" face in element "' + index + '" is invalid (got "' + ref + '").')
                    geometry.faces[i * 2].materialIndex = textureIndex
                    geometry.faces[i * 2 + 1].materialIndex = textureIndex

                    let uv = element.faces[face].uv

                    if (clipUVs) {
                        uv.forEach((e: string, pos: string) => {
                            if (typeof e != 'number') throw new Error('The "uv" property for "' + face + '" face in element "' + index + '" is invalid (got "' + e + '" at index "' + pos + '").')
                        })
                        uv.map((e: number) => {
                            if (e + 0.00001 < 0) {
                                return 0
                            } else if (e - 0.00001 > 16) {
                                return 16
                            } else {
                                return e
                            }
                        })
                    } else {
                        uv.forEach((e: string | number, pos: string) => {
                            if (typeof e != 'number' || e + 0.00001 < 0 || e - 0.00001 > 16) throw new Error('The "uv" property for "' + face + '" face in element "' + index + '" is invalid (got "' + e + '" at index "' + pos + '").')
                        })
                    }
                    uv = uv.map((e: number) => {
                        return e / 16
                    })
                    uv[0] += 0.0005
                    uv[1] += 0.0005
                    uv[2] -= 0.0005
                    uv[3] -= 0.0005
                    let map = [
                        new Vector2(uv[0], 1 - uv[1]),
                        new Vector2(uv[0], 1 - uv[3]),
                        new Vector2(uv[2], 1 - uv[3]),
                        new Vector2(uv[2], 1 - uv[1])
                    ]
                    if (element.faces[face].hasOwnProperty('rotation')) {
                        let amount = element.faces[face].rotation

                        if (!([0, 90, 180, 270].indexOf(amount) >= 0))
                            throw new Error('The "rotation" property for "' + face + '" face in element "' + index + '" is invalid (got "' + amount + '").')

                        for (let j = 0; j < amount / 90; j++) {
                            map = [map[1], map[2], map[3], map[0]]
                        }
                    }
                    geometry.faceVertexUvs[0][i * 2] = [map[0], map[1], map[3]]
                    geometry.faceVertexUvs[0][i * 2 + 1] = [map[1], map[2], map[3]]
                } else {

                    geometry.faces[i * 2].materialIndex = references.length
                    geometry.faces[i * 2 + 1].materialIndex = references.length
                    let map = [
                        new Vector2(0, 0),
                        new Vector2(1, 0),
                        new Vector2(1, 1),
                        new Vector2(0, 1)
                    ]
                    geometry.faceVertexUvs[0][i * 2] = [map[0], map[1], map[3]]
                    geometry.faceVertexUvs[0][i * 2 + 1] = [map[1], map[2], map[3]]
                }
            }
        }

        let mesh = new Mesh(geometry, material)
        mesh.position.x = origin.x
        mesh.position.y = origin.y
        mesh.position.z = origin.z

        if (element.hasOwnProperty('rotation')) {

            if (!element.rotation.hasOwnProperty('origin'))
                throw new Error('Couldn\'t find "origin" property in "rotation" for element "' + index + '".')
            if (!(element.rotation.origin.length == 3))
                throw new Error('"origin" property in "rotation" for element "' + index + '" is invalid.')
            if (!element.rotation.hasOwnProperty('axis'))
                throw new Error('Couldn\'t find "axis" property in "rotation" for element "' + index + '".')
            if (!((['x', 'y', 'z']).indexOf(element.rotation.axis) >= 0))
                throw new Error('"axis" property in "rotation" for element "' + index + '" is invalid.')
            if (!element.rotation.hasOwnProperty('angle'))
                throw new Error('Couldn\'t find "angle" property in "rotation" for element "' + index + '".')
            if (!(([45, 22.5, 0, -22.5, -45]).indexOf(element.rotation.angle) >= 0))
                throw new Error('"angle" property in "rotation" for element "' + index + '" is invalid.')

            let rotationOrigin = {
                x: element.rotation.origin[0] - 8,
                y: element.rotation.origin[1] - 8,
                z: element.rotation.origin[2] - 8
            }
            let axis = element.rotation.axis
            let angle = element.rotation.angle

            let pivot = new Group()
            pivot.position.x = rotationOrigin.x
            pivot.position.y = rotationOrigin.y
            pivot.position.z = rotationOrigin.z
            pivot.add(mesh)

            mesh.position.x -= rotationOrigin.x
            mesh.position.y -= rotationOrigin.y
            mesh.position.z -= rotationOrigin.z

            if (axis == 'x')
                pivot.rotateX(angle * Math.PI / 180)
            else if (axis == 'y')
                pivot.rotateY(angle * Math.PI / 180)
            else if (axis == 'z')
                pivot.rotateZ(angle * Math.PI / 180)

            group.add(pivot)
        } else {
            let pivot = new Group()
            pivot.add(mesh)

            group.add(pivot)
        }
    })

    this.add(group)

    let keys = ['thirdperson_righthand', 'thirdperson_lefthand', 'firstperson_righthand', 'firstperson_lefthand', 'gui', 'head', 'ground', 'fixed']
    this.displayOptions = {}
    for (let i = 0; i < keys.length; i++) {
        this.displayOptions[keys[i]] = {
            rotation: [0, 0, 0],
            translation: [0, 0, 0],
            scale: [1, 1, 1]
        }
    }
    this.displayOptions.firstperson = this.displayOptions.firstperson_righthand;
    this.displayOptions.thirdperson = this.displayOptions.thirdperson_righthand;
    if (model.hasOwnProperty('display')) {
        let display = model.display;
        for (let option in display) {
            if (this.displayOptions.hasOwnProperty(option)) {
                let fields = display[option];
                for (let name in fields) {
                    if (this.displayOptions[option].hasOwnProperty(name)) {
                        let field = fields[name];
                        if (field.length != 3 || typeof field[0] != 'number' || typeof field[1] != 'number' || typeof field[2] != 'number')
                            throw new Error('"' + name + '" property is invalid for display option "' + option + '".');
                        this.displayOptions[option][name] = field;
                    }
                }
            }
        }
    }

    self = this;

    this.getCenter = () => {
        let group = self.children[0];

        let box = {
            minx: 0,
            miny: 0,
            minz: 0,
            maxx: 0,
            maxy: 0,
            maxz: 0
        };
        for (let i = 0; i < group.children.length; i++) {
            let pivot = group.children[i];
            let mesh = pivot.children[0];
            for (let j = 0; j < mesh.geometry.vertices.length; j++) {

                let vertex = mesh.geometry.vertices[j].clone();
                let abs = mesh.localToWorld(vertex);

                if (abs.x < box.minx) box.minx = abs.x;
                if (abs.y < box.miny) box.miny = abs.y;
                if (abs.z < box.minz) box.minz = abs.z;
                if (abs.x > box.maxx) box.maxx = abs.x;
                if (abs.y > box.maxy) box.maxy = abs.y;
                if (abs.z > box.maxz) box.maxz = abs.z;
            }
        }

        return new Vector3(
            (box.minx + box.maxx) / 2,
            (box.miny + box.maxy) / 2,
            (box.minz + box.maxz) / 2
        );
    }

    this.applyDisplay = (option: any) => {
        let group = self.children[0];
        if (option == 'block') {
            group.rotation.set(0, 0, 0);
            group.position.set(0, 0, 0);
            group.scale.set(1, 1, 1);
        } else {
            if (!self.displayOptions.hasOwnProperty(option))
                throw new Error('Display option is invalid.');
            let options = self.displayOptions[option];
            let rot = options.rotation;
            let pos = options.translation;
            let scale = options.scale;
            group.rotation.set(rot[0] * Math.PI / 180, rot[1] * Math.PI / 180, rot[2] * Math.PI / 180);
            group.position.set(pos[0], pos[1], pos[2]);
            group.scale.set(scale[0] == 0 ? 0.00001 : scale[0], scale[1] == 0 ? 0.00001 : scale[1], scale[2] == 0 ? 0.00001 : scale[2]);
        }
    }
}

function sleep(ms: number) {
    return new Promise(cb => setTimeout(cb, ms));
}

JsonModel.prototype = Object.create(Object3D.prototype);
JsonModel.prototype.constructor = JsonModel;
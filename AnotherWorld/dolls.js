
/* =====================================================
   夢音 | YUME AUDIO SYSTEM
   3D DREAM GIRL — DOLLS.JS
   Three.js 0.160.1
   ===================================================== */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

console.log("YUME 3D DOLL SYSTEM STARTED");

// =====================================================
// 01 — CONTAINER
// =====================================================

const container = document.getElementById("yume-dolls-canvas");

if (!container) {
    console.error("YUME: #yume-dolls-canvas not found.");
} else {
    initDoll();
}

function initDoll() {

    // =================================================
    // 02 — SCENE / CAMERA / RENDERER
    // =================================================

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        35,
        1,
        0.1,
        100
    );

    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "default"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setClearColor(0x000000, 0);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.shadowMap.enabled = false;

    renderer.domElement.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        pointer-events: none;
    `;

    container.appendChild(renderer.domElement);

    // =================================================
    // 03 — LIGHTING
    // =================================================

    scene.add(
        new THREE.AmbientLight(0xffffff, 2.0)
    );

    const mainLight = new THREE.DirectionalLight(
        0xffffff,
        2.8
    );

    mainLight.position.set(-3, 6, 8);
    scene.add(mainLight);

    const greenLight = new THREE.PointLight(
        0x50ff9a,
        20,
        12
    );

    greenLight.position.set(3, 3, 4);
    scene.add(greenLight);

    // =================================================
    // 04 — MATERIALS
    // =================================================

    function material(color, roughness = 0.8) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness: 0.05
        });
    }

    const skin = material(0xe7aa86);
    const hairGreen = material(0x16a86d);
    const hairDark = material(0x08704b);
    const hairLight = material(0x42d997);

    const white = material(0xecece8);
    const gray = material(0xa9b1b1);
    const black = material(0x171a1c);
    const skirtColor = material(0x292e35);

    const eyeWhite = material(0xfff3dc);
    const irisGold = material(0xc4a13e);
    const pupil = material(0x17120d);

    const sockWhite = material(0xf2f0e9);
    const bootBlack = material(0x202329);

    // =================================================
    // 05 — MAIN DOLL GROUP
    // =================================================

    const doll = new THREE.Group();
    scene.add(doll);

    const body = new THREE.Group();
    doll.add(body);

    // =================================================
    // 06 — HELPER FUNCTIONS
    // =================================================

    function sphere(
        parent,
        mat,
        x, y, z,
        sx, sy, sz
    ) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(1, 24, 16),
            mat
        );

        mesh.position.set(x, y, z);
        mesh.scale.set(sx, sy, sz);

        parent.add(mesh);

        return mesh;
    }

    function box(
        parent,
        mat,
        x, y, z,
        sx, sy, sz
    ) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sx, sy, sz),
            mat
        );

        mesh.position.set(x, y, z);
        parent.add(mesh);

        return mesh;
    }

    function cylinder(
        parent,
        mat,
        x, y, z,
        radiusTop,
        radiusBottom,
        height,
        segments = 16
    ) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(
                radiusTop,
                radiusBottom,
                height,
                segments
            ),
            mat
        );

        mesh.position.set(x, y, z);
        parent.add(mesh);

        return mesh;
    }

    // =================================================
    // 07 — HEAD
    // =================================================

    const head = new THREE.Group();
    head.position.y = 1.35;
    body.add(head);

    sphere(
        head,
        skin,
        0, 0, 0,
        0.73, 0.68, 0.58
    );

    // Ears

    sphere(head, skin, -0.72, -0.08, 0, 0.13, 0.19, 0.12);
    sphere(head, skin, 0.72, -0.08, 0, 0.13, 0.19, 0.12);

    // =================================================
    // 08 — EYES
    // =================================================

    function createEye(x) {

        sphere(
            head,
            eyeWhite,
            x, 0.02, 0.52,
            0.22, 0.16, 0.07
        );

        sphere(
            head,
            irisGold,
            x, 0.015, 0.584,
            0.115, 0.135, 0.035
        );

        sphere(
            head,
            pupil,
            x, 0.012, 0.615,
            0.053, 0.09, 0.018
        );

        sphere(
            head,
            white,
            x - 0.035, 0.07, 0.633,
            0.03, 0.03, 0.012
        );

    }

    createEye(-0.29);
    createEye(0.29);

    // =================================================
    // 09 — BLACK FACE MASK
    // =================================================

    const mask = sphere(
        head,
        black,
        0, -0.27, 0.51,
        0.47, 0.22, 0.12
    );

    mask.rotation.x = -0.08;

    // =================================================
    // 10 — GREEN HAIR
    // =================================================

    // Main hair cap

    sphere(
        head,
        hairGreen,
        0, 0.32, -0.09,
        0.81, 0.55, 0.67
    );

    // Back hair

    sphere(
        head,
        hairDark,
        0, -0.12, -0.40,
        0.78, 0.57, 0.37
    );

    // Left side hair

    sphere(
        head,
        hairGreen,
        -0.70, -0.18, 0.02,
        0.22, 0.47, 0.35
    );

    // Right side hair

    sphere(
        head,
        hairGreen,
        0.70, -0.18, 0.02,
        0.22, 0.47, 0.35
    );

    // Front bangs

    for (let i = 0; i < 7; i++) {

        const x = -0.57 + i * 0.19;

        const bang = sphere(
            head,
            i % 2 === 0 ? hairGreen : hairLight,
            x,
            0.28 - Math.abs(x) * 0.13,
            0.49,
            0.15,
            0.30,
            0.14
        );

        bang.rotation.z = x * -0.28;

    }

    // Extra hair strands

    for (let i = 0; i < 5; i++) {

        const strand = sphere(
            head,
            i % 2 ? hairGreen : hairDark,
            -0.65 + i * 0.32,
            -0.28,
            -0.25,
            0.16,
            0.32,
            0.20
        );

        strand.rotation.z = (i - 2) * 0.12;

    }

    // =================================================
    // 11 — TORSO / SAILOR BLOUSE
    // =================================================

    sphere(
        body,
        white,
        0, 0.18, 0,
        0.48, 0.61, 0.30
    );

    // Neck

    cylinder(
        body,
        skin,
        0, 0.77, 0,
        0.13, 0.13, 0.24
    );

    // Sailor collar

    const collar = new THREE.Group();
    collar.position.set(0, 0.52, 0.26);
    body.add(collar);

    const leftCollar = box(
        collar,
        black,
        -0.18, 0, 0,
        0.29, 0.12, 0.06
    );

    leftCollar.rotation.z = -0.45;

    const rightCollar = box(
        collar,
        black,
        0.18, 0, 0,
        0.29, 0.12, 0.06
    );

    rightCollar.rotation.z = 0.45;

    // White front bow

    sphere(
        body,
        white,
        -0.14, 0.35, 0.34,
        0.19, 0.11, 0.08
    );

    sphere(
        body,
        white,
        0.14, 0.35, 0.34,
        0.19, 0.11, 0.08
    );

    sphere(
        body,
        gray,
        0, 0.35, 0.41,
        0.065, 0.07, 0.04
    );

    // Bow ribbon

    const ribbon = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.34, 4),
        white
    );

    ribbon.position.set(0, 0.13, 0.38);
    ribbon.rotation.z = Math.PI;

    body.add(ribbon);

    // =================================================
    // 12 — ARMS
    // =================================================

    function createArm(side) {

        const arm = new THREE.Group();

        arm.position.set(side * 0.48, 0.49, 0);
        body.add(arm);

        const sleeve = sphere(
            arm,
            white,
            side * 0.15, -0.32, 0,
            0.25, 0.46, 0.25
        );

        sleeve.rotation.z = side * 0.30;

        // Cuff

        const cuff = box(
            arm,
            black,
            side * 0.27, -0.70, 0,
            0.35, 0.12, 0.34
        );

        cuff.rotation.z = side * 0.25;

        // Hand

        sphere(
            arm,
            skin,
            side * 0.29, -0.83, 0,
            0.13, 0.17, 0.12
        );

        return arm;
    }

    const leftArm = createArm(-1);
    const rightArm = createArm(1);

    // =================================================
    // 13 — PLEATED SKIRT
    // =================================================

    const skirt = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.42,
            0.77,
            0.60,
            16,
            1
        ),
        skirtColor
    );

    skirt.position.y = -0.59;
    body.add(skirt);

    // Pleat details

    for (let i = 0; i < 16; i++) {

        const angle = (i / 16) * Math.PI * 2;

        const pleat = new THREE.Mesh(
            new THREE.BoxGeometry(0.065, 0.49, 0.045),
            black
        );

        pleat.position.set(
            Math.sin(angle) * 0.65,
            -0.64,
            Math.cos(angle) * 0.65
        );

        pleat.rotation.y = angle;

        body.add(pleat);

    }

    // =================================================
    // 14 — LEGS / SOCKS / BOOTS
    // =================================================

    function createLeg(side) {

        const x = side * 0.28;

        // Upper leg

        cylinder(
            body,
            skin,
            x, -1.17, 0,
            0.16, 0.15, 0.70
        );

        // White sock

        cylinder(
            body,
            sockWhite,
            x, -1.67, 0,
            0.19, 0.19, 0.43
        );

        // Sock folds

        for (let i = 0; i < 3; i++) {

            cylinder(
                body,
                sockWhite,
                x,
                -1.48 - i * 0.12,
                0,
                0.21,
                0.21,
                0.075
            );

        }

        // Boot shaft

        box(
            body,
            bootBlack,
            x, -2.03, 0,
            0.38, 0.43, 0.40
        );

        // Boot toe

        sphere(
            body,
            bootBlack,
            x, -2.23, 0.16,
            0.24, 0.15, 0.35
        );

        // Boot sole

        box(
            body,
            black,
            x, -2.32, 0.10,
            0.49, 0.11, 0.67
        );

    }

    createLeg(-1);
    createLeg(1);

    // =================================================
    // 15 — POSITION AND RESIZE
    // =================================================

    function resize() {

        const width =
            container.clientWidth || window.innerWidth;

        const height =
            container.clientHeight || window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height, false);

        const visibleHeight =
            2 *
            Math.tan(
                THREE.MathUtils.degToRad(camera.fov / 2)
            ) *
            camera.position.z;

        const visibleWidth =
            visibleHeight * camera.aspect;

        // Character is approximately 4.9 units tall.
        // Display it at about 38% of screen height.

        const dollHeight = visibleHeight * 0.38;
        const scale = dollHeight / 4.9;

        doll.scale.setScalar(scale);

        // Upper-right placement

doll.position.x =
    visibleWidth / 2 -
    visibleWidth * 0.15;

doll.position.y =
    visibleHeight / 2 -
    dollHeight / 2 -
    visibleHeight * 0.09;

doll.position.z = 0;
    }

    resize();

    window.addEventListener("resize", resize);

    // =================================================
    // 16 — ANIMATION
    // =================================================

    const clock = new THREE.Clock();

    function animate() {

        const time = clock.getElapsedTime();

        // Gentle floating

        body.position.y =
            Math.sin(time * 1.6) * 0.07;

        // Slow 360-degree rotation

        body.rotation.y = time * 0.38;

        // Slight head movement

        head.rotation.z =
            Math.sin(time * 1.2) * 0.035;

        // Gentle arm movement

        leftArm.rotation.z =
            Math.sin(time * 1.5) * 0.045;

        rightArm.rotation.z =
            -Math.sin(time * 1.5) * 0.045;

        renderer.render(scene, camera);

    }

    renderer.setAnimationLoop(animate);

    console.log("YUME DREAM GIRL 3D LOADED!");

}

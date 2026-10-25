
/* ==========================================
   夢音 — YUME AUDIO SYSTEM
   COMPLETE MUSIC PLAYER
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ==========================================
    // 01 — ELEMENTS
    // ==========================================

    const $ = (id) => document.getElementById(id);

    const audio = $("audio-player");
    const upload = $("music-upload");
    const trackName = $("track-name");

    const particleCanvas = $("particle-canvas");
    const spectrumCanvas = $("audio-visualizer");

    const buttons = [
        ...document.querySelectorAll(
            ".menu-item[data-action]"
        )
    ];

    const guideWindow = $("options-window");
    const helpWindow = $("help-window");
    const loadingScreen = $("loading-screen");

    if (
        !audio ||
        !upload ||
        !particleCanvas ||
        !spectrumCanvas
    ) {
        console.error(
            "YUME: Required music player elements are missing."
        );
        return;
    }

    const particleCtx = particleCanvas.getContext("2d");
    const spectrumCtx = spectrumCanvas.getContext("2d");

    if (!particleCtx || !spectrumCtx) return;

    // ==========================================
    // 02 — BUILT-IN PLAYLIST
    // ==========================================

    const builtInPlaylist = [
        {
            name: "Date of Birth - how do you think?",
            url: "./music/Date of Birth- how do you think_.mp3"
        },
        {
            name: "任天堂サイバーコア",
            url: "./music/任天堂サイバーコア.mp3"
        },
        {
            name: "忘れられたPS1の夏を見つけた",
            url: "./music/忘れられたPS1の夏を見つけた.mp3"
        },
        {
            name: "猫ブレイクダンス1時間",
            url: "./music/猫ブレイクダンス1時間.mp3"
        }
    ];

    let playlist = builtInPlaylist;
    let uploadedPlaylist = [];
    let currentTrackIndex = 0;

    // ==========================================
    // 03 — AUDIO ENGINE
    // ==========================================

    let audioContext = null;
    let analyser = null;
    let frequencyData = null;

    function initializeAudio() {
        if (audioContext) return;

        // Browsers may silence Web Audio sources loaded from file://.
        // Preserve direct HTMLAudioElement playback in that mode.
        if (window.location.protocol === "file:") {
            console.warn("YUME: file:// mode — use Live Server for music-reactive visualizer.");
            return;
        }

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            console.error("Web Audio API unavailable.");
            return;
        }

        audioContext = new AudioContextClass();

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096;
        analyser.smoothingTimeConstant = 0.72;

        frequencyData = new Uint8Array(
            analyser.frequencyBinCount
        );

        const source =
            audioContext.createMediaElementSource(audio);

        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    // ==========================================
    // 04 — SOUND EFFECTS
    // ==========================================

    const selectionSound = new Audio(
        "./audio/Mortal Komabat selection sound.mp3"
    );

    const confirmationSound = new Audio(
        "./audio/After selecting sound.mp3"
    );

    const loadingSound = new Audio(
        "./audio/loading.mp3"
    );

    selectionSound.preload = "auto";
    confirmationSound.preload = "auto";
    loadingSound.preload = "auto";

    selectionSound.volume = 0.45;
    confirmationSound.volume = 0.65;
    loadingSound.volume = 0.5;

    function playSound(sound) {
        sound.pause();
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }


    
    // ==========================================
    // 05 — LOADING AUDIO
    // ==========================================

    let loadingFinished = false;

    function playLoadingSound() {
        if (!loadingScreen || loadingFinished) return;

        loadingSound.volume = 0.7;
        loadingSound.currentTime = 0;

        loadingSound.play()
            .then(() => {
                console.log("YUME LOADING SOUND PLAYING");
            })
            .catch(error => {
                console.warn(
                    "Browser blocked loading audio:",
                    error.message
                );
            });
    }

    function stopLoadingSound() {
        loadingSound.pause();
        loadingSound.currentTime = 0;
    }

    // Retry only if the browser blocked autoplay.
    document.addEventListener("pointerdown", () => {
        if (
            !loadingFinished &&
            loadingScreen?.isConnected &&
            loadingSound.paused
        ) {
            loadingSound.play().catch(console.warn);
        }
    });



    // ==========================================
    // 06 — MENU SYSTEM
    // ==========================================

    let selectedMenu = Math.max(
        0,
        buttons.findIndex(button =>
            button.classList.contains("active")
        )
    );

    let previousAction = "load";

    function highlightMenu(action) {
        buttons.forEach((button, index) => {
            const active =
                button.dataset.action === action;

            button.classList.toggle("active", active);

            if (active) selectedMenu = index;
        });
    }

    function selectMenu(index, withSound = true) {
        if (!buttons.length) return;

        const nextIndex =
            (index + buttons.length) % buttons.length;

        if (nextIndex !== selectedMenu && withSound) {
            playSound(selectionSound);
        }

        selectedMenu = nextIndex;

        buttons.forEach((button, i) => {
            button.classList.toggle(
                "active",
                i === selectedMenu
            );
        });
    }

    // ==========================================
    // 07 — MUSIC PLAYBACK
    // ==========================================

    async function playMusic() {
        if (!audio.getAttribute("src")) {
            loadTrack(currentTrackIndex, false);
        }

        if (!audio.getAttribute("src")) return;

        try {
            initializeAudio();

            if (audioContext?.state === "suspended") {
                await audioContext.resume();
            }

            await audio.play();
            highlightMenu("play");

        } catch (error) {
            console.error("Music playback error:", error);
            alert("YUME couldn't play this song. Check that the MP3 exists in your music folder, or use LOAD to select a song.");
        }
    }

    function pauseMusic() {
        audio.pause();
        highlightMenu("pause");
    }

    // ==========================================
    // 08 — PLAYLIST CONTROLS
    // ==========================================

    function loadTrack(index, autoplay = false) {
        if (!playlist.length) return;

        currentTrackIndex =
            (index + playlist.length) % playlist.length;

        const track = playlist[currentTrackIndex];

        audio.pause();
        audio.src = track.url;
        audio.load();

        if (trackName) {
            trackName.textContent =
                track.name.replace(/\.[^.]+$/, "");
        }

        console.log(
            "YUME NOW PLAYING:",
            track.name
        );

        if (autoplay) {
            void playMusic();
        }
    }

    function nextTrack() {
        // Continue within the active playlist, including uploaded songs.
        if (!playlist.length) return;
        loadTrack(currentTrackIndex + 1, true);
    }

    // ==========================================
    // 09 — LOAD MUSIC FROM COMPUTER
    // ==========================================

    upload.addEventListener("change", () => {
        const files = [...(upload.files || [])].filter(
            file =>
                file.type.startsWith("audio/") ||
                /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(
                    file.name
                )
        );

        if (!files.length) {
            upload.value = "";
            return;
        }

        audio.pause();

        uploadedPlaylist.forEach(track => {
            URL.revokeObjectURL(track.url);
        });

        uploadedPlaylist = files.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file)
        }));

        playlist = uploadedPlaylist;

        loadTrack(0, true);

        upload.value = "";
    });

    audio.addEventListener("ended", () => {
        if (playlist.length > 1) {
            loadTrack(currentTrackIndex + 1, true);
        } else {
            highlightMenu("pause");
        }
    });

    audio.addEventListener("play", () => {
        highlightMenu("play");
    });

    audio.addEventListener("pause", () => {
        if (
            !audio.ended &&
            guideWindow?.hidden !== false
        ) {
            highlightMenu("pause");
        }
    });

    audio.addEventListener("error", () => {
        console.error(
            "Could not load music:",
            audio.currentSrc
        );
    });

    window.addEventListener("beforeunload", () => {
        uploadedPlaylist.forEach(track => {
            URL.revokeObjectURL(track.url);
        });
    });

    // Prepare the first built-in song.
    loadTrack(0, false);

    // ==========================================
    // 10 — GUIDE WINDOW
    // ==========================================

    function openGuide() {
        if (!guideWindow) return;

        const activeButton = buttons.find(button =>
            button.classList.contains("active")
        );

        if (
            activeButton &&
            activeButton.dataset.action !== "options"
        ) {
            previousAction = activeButton.dataset.action;
        }

        guideWindow.hidden = false;
        highlightMenu("options");

        $("close-options")?.focus();
    }

    function closeGuide() {
        if (!guideWindow) return;

        guideWindow.hidden = true;
        highlightMenu(previousAction);
    }

    $("close-options")?.addEventListener(
        "click",
        closeGuide
    );

    $("options-back")?.addEventListener(
        "click",
        closeGuide
    );

    guideWindow?.addEventListener("click", event => {
        if (event.target === guideWindow) {
            closeGuide();
        }
    });

    // ==========================================
    // 11 — BUTTON ACTIONS
    // ==========================================

    function activateMenu(button) {
        if (!button) return;

        selectionSound.pause();
        selectionSound.currentTime = 0;

        playSound(confirmationSound);

        switch (button.dataset.action) {
            case "load":
                highlightMenu("load");
                upload.click();
                break;

            case "play":
                void playMusic();
                break;

            case "pause":
                pauseMusic();
                break;

            case "next":
                nextTrack();
                break;

            case "options":
                openGuide();
                break;
        }
    }

    buttons.forEach((button, index) => {
        button.addEventListener(
            "pointerenter",
            event => {
                if (event.pointerType === "mouse") {
                    selectMenu(index);
                }
            }
        );

        button.addEventListener("focus", () => {
            if (button.matches(":focus-visible")) {
                selectMenu(index);
            }
        });

        button.addEventListener("click", () => {
            selectMenu(index, false);
            activateMenu(button);
        });
    });

    // ==========================================
    // 12 — KEYBOARD CONTROLS
    // ==========================================

    function loadingVisible() {
        return Boolean(
            loadingScreen &&
            loadingScreen.isConnected &&
            !loadingScreen.classList.contains(
                "loading-finished"
            )
        );
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (guideWindow && !guideWindow.hidden) {
                closeGuide();
                return;
            }

            if (helpWindow && !helpWindow.hidden) {
                helpWindow.hidden = true;
                return;
            }

            if (loadingVisible()) {
                finishLoading();
            }

            return;
        }

        if (
            loadingVisible() ||
            (guideWindow && !guideWindow.hidden) ||
            (helpWindow && !helpWindow.hidden)
        ) {
            return;
        }

        const target = event.target;

        if (
            /^(INPUT|TEXTAREA|SELECT)$/.test(
                target?.tagName || ""
            ) ||
            target?.isContentEditable
        ) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            selectMenu(selectedMenu + 1);
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            selectMenu(selectedMenu - 1);
        }

        if (
            event.key === "Enter" &&
            buttons.length &&
            !target?.closest?.(
                "button, a, [role='button']"
            )
        ) {
            event.preventDefault();
            activateMenu(buttons[selectedMenu]);
        }
    });

   

    // ==========================================
    // 14 — FREQUENCY ENERGY
    // ==========================================

    function getEnergy(lowHz, highHz) {
        if (
            !audioContext ||
            !analyser ||
            !frequencyData ||
            audio.paused ||
            audio.ended
        ) {
            return 0;
        }

        const hzPerBin =
            audioContext.sampleRate / analyser.fftSize;

        const firstBin = Math.max(
            0,
            Math.floor(lowHz / hzPerBin)
        );

        const lastBin = Math.min(
            frequencyData.length - 1,
            Math.ceil(highHz / hzPerBin)
        );

        let total = 0;

        for (
            let i = firstBin;
            i <= lastBin;
            i++
        ) {
            total += frequencyData[i];
        }

        const count = Math.max(
            1,
            lastBin - firstBin + 1
        );

        return total / count / 255;
    }

    // ==========================================
    // 15 — PARTICLE GALAXY
    // ==========================================

    const particles = Array.from(
        { length: 650 },
        () => ({
            x: Math.random(),
            y: Math.random(),
            radius: 0.4 + Math.random() * 1.5,
            speed: 0.00015 + Math.random() * 0.00045,
            alpha: 0.25 + Math.random() * 0.7,
            phase: Math.random() * Math.PI * 2
        })
    );

    let animationTime = 0;

    let smoothBass = 0;
    let smoothMids = 0;
    let smoothTreble = 0;

    function drawParticles() {
        const width = particleCanvas.width;
        const height = particleCanvas.height;

        particleCtx.clearRect(
            0,
            0,
            width,
            height
        );

        const bass = getEnergy(35, 180);
        const mids = getEnergy(180, 2500);
        const treble = getEnergy(2500, 10000);

        smoothBass +=
            (bass - smoothBass) * 0.35;

        smoothMids +=
            (mids - smoothMids) * 0.30;

        smoothTreble +=
            (treble - smoothTreble) * 0.30;

        const glow =
            particleCtx.createRadialGradient(
                width / 2,
                height / 2,
                0,
                width / 2,
                height / 2,
                width * 0.6
            );

        glow.addColorStop(
            0,
            `rgba(0,255,215,${
                0.07 + smoothBass * 0.5
            })`
        );

        glow.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        particleCtx.fillStyle = glow;

        particleCtx.fillRect(
            0,
            0,
            width,
            height
        );

        for (const particle of particles) {
            const movement =
                1 +
                smoothBass * 5 +
                smoothMids * 2;

            particle.y -=
                particle.speed * movement;

            if (particle.y < -0.02) {
                particle.y = 1.02;
                particle.x = Math.random();
            }

            const wave = Math.sin(
                animationTime * 0.008 +
                particle.phase
            );

            const x = (
                particle.x +
                wave * (
                    0.01 +
                    smoothMids * 0.035
                )
            ) * width;

            const y = particle.y * height;

            const radius = Math.max(
                0.3,
                particle.radius * (
                    1 +
                    smoothBass * 2.5 +
                    smoothTreble * 0.8
                )
            );

            const alpha = Math.min(
                1,
                particle.alpha * (
                    0.7 +
                    smoothBass * 0.8 +
                    smoothTreble * 0.5
                )
            );

            particleCtx.beginPath();

            particleCtx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );

            particleCtx.fillStyle =
                `rgba(75,255,218,${alpha})`;

            particleCtx.fill();
        }
    }

    // ==========================================
    // 16 — EMERALD MUSIC SPECTRUM
    // ==========================================

    const barCount = 60;
    const spectrumLevels = new Float32Array(barCount);

    function resizeCanvases() {
        for (const canvas of [particleCanvas, spectrumCanvas]) {
            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) continue;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.max(1, Math.round(rect.width * dpr));
            const height = Math.max(1, Math.round(rect.height * dpr));
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
        }
    }

    window.addEventListener("resize", resizeCanvases);
    if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(resizeCanvases);
        observer.observe(particleCanvas);
        observer.observe(spectrumCanvas);
    }
    resizeCanvases();

    // Keep a visible emerald line even before music starts.
    // When paused, retain the last drawn shape exactly.
    let spectrumHasPlayed = false;
    for (let i = 0; i < barCount; i++) {
        const center = (barCount - 1) / 2;
        spectrumLevels[i] = 0.10 + 0.16 * Math.exp(-Math.pow((i - center) / 13, 2))
            + 0.035 * Math.sin(i * 0.75) ** 2;
    }

    function drawSpectrum() {
        const width = spectrumCanvas.width;
        const height = spectrumCanvas.height;
        if (!width || !height) return;

        spectrumCtx.clearRect(0, 0, width, height);
        const playing = !audio.paused && !audio.ended && audio.readyState >= 2;
        const left = width * 0.045;
        const bottom = height * 0.12;
        const plotWidth = width - left * 2;
        const plotHeight = height * 0.76;
        const baseline = height - bottom;
        const slot = plotWidth / barCount;
        const barWidth = Math.max(1, slot * 0.78);

        if (playing) {
            spectrumHasPlayed = true;
            const t = audio.currentTime;
            for (let i = 0; i < barCount; i++) {
                let amplitude;
                if (analyser && frequencyData && audioContext) {
                    const fraction = i / (barCount - 1);
                    const hz = 40 * Math.pow(14000 / 40, fraction);
                    const bin = Math.min(frequencyData.length - 1,
                        Math.round(hz * analyser.fftSize / audioContext.sampleRate));
                    let total = 0;
                    for (let j = -2; j <= 2; j++) {
                        const idx = Math.max(0, Math.min(frequencyData.length - 1, bin + j));
                        total += frequencyData[idx];
                    }
                    amplitude = 0.08 + Math.pow(total / (5 * 255), 0.72) * 0.84;
                } else {
                    // file:// visual fallback; true audio response requires Live Server.
                    amplitude = 0.13 + 0.22 * Math.sin(i * 0.27 + t * 4) ** 2
                        + 0.28 * Math.sin(i * 0.54 - t * 7) ** 4;
                }
                spectrumLevels[i] += (Math.min(0.95, amplitude) - spectrumLevels[i]) * 0.32;
            }
        }

        // Neon baseline stays visible, including when paused.
        spectrumCtx.save();
        spectrumCtx.strokeStyle = "#20ff9e";
        spectrumCtx.lineWidth = Math.max(1.5, height * 0.012);
        spectrumCtx.shadowColor = "#00f59a";
        spectrumCtx.shadowBlur = Math.max(4, width / 65);
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(left, baseline);
        spectrumCtx.lineTo(width - left, baseline);
        spectrumCtx.stroke();

        for (let i = 0; i < barCount; i++) {
            const barHeight = Math.max(4, spectrumLevels[i] * plotHeight);
            const x = left + i * slot + (slot - barWidth) / 2;
            spectrumCtx.fillStyle = "#12ff9b";
            spectrumCtx.fillRect(x, baseline - barHeight, barWidth, barHeight);
        }
        spectrumCtx.restore();
    }


    // ==========================================
    // 17 — ANIMATION LOOP
    // ==========================================

    function animate() {
        animationTime++;

        if (analyser && frequencyData) {
            if (!audio.paused && !audio.ended) {
                analyser.getByteFrequencyData(
                    frequencyData
                );
            } else {
                frequencyData.fill(0);
            }
        }

        drawSpectrum();
        drawParticles();

        requestAnimationFrame(animate);
    }

    animate();

    // ==========================================
    // 18 — DIGITAL ARCHIVE LOADING SCREEN
    // ==========================================

    let progress = 0;
    let loadingInterval = null;

    const loadingStages = [
        [
            0,
            "記憶領域にアクセスしています...",
            "INITIALIZING",
            "ACCESSING MEMORY"
        ],
        [
            20,
            "音声データを検索しています...",
            "SEARCHING",
            "SEARCHING AUDIO DATA"
        ],
        [
            45,
            "記憶を再構築しています...",
            "RECONSTRUCTING",
            "REBUILDING ARCHIVE"
        ],
        [
            70,
            "音の世界へ接続しています...",
            "CONNECTING",
            "CONNECTING TO AUDIO"
        ],
        [
            90,
            "接続が完了しました。",
            "CONNECTED",
            "ARCHIVE READY"
        ]
    ];

    function updateLoading() {
        if (!loadingScreen) return;

        const progressBar = $("loading-progress");
        const percentText = $("loading-percent");
        const memoryValue = $("memory-value");
        const systemValue = $("system-value");

        if (progressBar) {
            progressBar.style.width =
                `${progress}%`;
        }

        if (percentText) {
            percentText.textContent =
                `${String(progress).padStart(3, "0")}%`;
        }

        if (memoryValue) {
            memoryValue.textContent =
                String(progress * 40).padStart(4, "0");
        }

        const stage = [...loadingStages]
            .reverse()
            .find(item => progress >= item[0]);

        if (stage) {
            if ($("archive-message")) {
                $("archive-message").textContent =
                    stage[1];
            }

            if ($("archive-status")) {
                $("archive-status").textContent =
                    stage[2];
            }

            if ($("loading-label")) {
                $("loading-label").textContent =
                    stage[3];
            }
        }

        if (systemValue) {
            systemValue.textContent =
                progress >= 100
                    ? "READY"
                    : "READ";
        }
    }

    function finishLoading() {
        if (!loadingScreen || loadingFinished) {
            return;
        }

        loadingFinished = true;

        clearInterval(loadingInterval);

        progress = 100;
        updateLoading();

        stopLoadingSound();

        loadingScreen.classList.add(
            "archive-glitch"
        );

        setTimeout(() => {
            loadingScreen.classList.remove(
                "archive-glitch"
            );

            loadingScreen.classList.add(
                "loading-finished"
            );

            setTimeout(() => {
                loadingScreen.remove();
                resizeCanvases();
            }, 1100);

        }, 350);
    }

   
    if (loadingScreen) {

        // Begin loading sound immediately.
        playLoadingSound();

        updateLoading();

        loadingInterval = setInterval(() => {

            if (loadingFinished) return;

            progress = Math.min(100, progress + 1);

            updateLoading();

            if (progress >= 100) {
                finishLoading();
            }

        }, 70);

        $("skip-loading")?.addEventListener(
            "click",
            finishLoading
        );
    }

     // ==========================================
    // 19 — HELP WINDOW
    // ==========================================

    $("help-button")?.addEventListener(
        "click",
        () => {
            if (helpWindow) {
                helpWindow.hidden = false;
            }
        }
    );

    $("close-help")?.addEventListener(
        "click",
        () => {
            if (helpWindow) {
                helpWindow.hidden = true;
            }
        }
    );

    helpWindow?.addEventListener(
        "click",
        event => {
            if (event.target === helpWindow) {
                helpWindow.hidden = true;
            }
        }
    );

});


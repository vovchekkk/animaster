addListeners();

function animaster() {
    /**
     * Блок плавно появляется из прозрачного.
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     */
    function fadeIn(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function resetFadeIn(element) {
        element.style.transitionDuration = null;
        element.classList.add('hide');
        element.classList.remove('show');
    }

    function fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.add('hide');
        element.classList.remove('show');
    }

    function resetFadeOut(element) {
        element.style.transitionDuration = null;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    /**
     * Функция, передвигающая элемент
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     * @param translation — объект с полями x и y, обозначающими смещение блока
     */

    function move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
    }

    /**
     * Функция, увеличивающая/уменьшающая элемент
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     * @param ratio — во сколько раз увеличить/уменьшить. Чтобы уменьшить, нужно передать значение меньше 1
     */
    function scale(element, duration, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
    }

    function resetMoveAndHide(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
        this.addFadeIn(0).play(element);
    }

    async function moveAndHide(element, duration, translation) {
        const moveDuration = duration * 2 / 5;
        const hideDuration = duration * 3 / 5;

        this.addMove(moveDuration, translation)
            .addDelay(moveDuration)
            .addFadeOut(hideDuration)
            .play(element);

        return {
            reset: resetMoveAndHide.bind(this, element)
        };
    }

    async function showAndHide(element, duration) {
        this.addFadeIn(duration * 1 / 3)
            .addDelay(duration)
            .addFadeOut(duration * 1 / 3)
            .play(element)
    }

    function heartBeating(element) {
        return this.addScale(500, 1.4)
            .addScale(500, 1)
            .play(element, true);
    }

    function addDelay(duration) {
        this._steps.push({op_name: 'addDelay', duration, args: {}});
        return this;
    }

    function addScale(duration, ratio) {
        this._steps.push({op_name: 'scale', duration, args: {ratio}});
        return this;
    }

    function addFadeIn(duration) {
        this._steps.push({op_name: 'fadeIn', duration, args: {}});
        return this;
    }

    function addFadeOut(duration) {
        this._steps.push({op_name: 'fadeOut', duration, args: {}});
        return this;
    }

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function addMove(duration, translation) {
        this._steps.push({op_name: 'move', duration, args: {translation}});
        return this;
    }
    
    function play(element, cycled) {
        let isRunning = { value: true }; // Используем объект для ссылки
        const savedSteps = [...this._steps];
        this._steps = [];

        const execute = async () => {
            for (const step of savedSteps) {
                if (!isRunning.value) return;

                if (step.op_name === 'move') move(element, step.duration, step.args.translation);
                if (step.op_name === 'scale') scale(element, step.duration, step.args.ratio);
                if (step.op_name === 'fadeIn') fadeIn(element, step.duration);
                if (step.op_name === 'fadeOut') fadeOut(element, step.duration);

                await wait(step.duration);
            }
        };

        const run = async () => {
            if (cycled) {
                while (isRunning.value) {
                    await execute();
                }
            } else {
                await execute();
            }
        };

        run();

        return {
            stop() {
                isRunning.value = false;
            }
        };
    }

    return {
        _steps: [],
        fadeIn: fadeIn,
        fadeOut: fadeOut,
        move: move,
        scale: scale,
        moveAndHide: moveAndHide,
        showAndHide: showAndHide,
        heartBeating: heartBeating,
        addMove: addMove,
        addScale: addScale,
        addFadeIn: addFadeIn,
        addFadeOut: addFadeOut,
        addDelay: addDelay,
        play: play,
    }
}

async function addListeners() {
    let heartBeater;
    let moveAndHider;

    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().addFadeIn(5000).play(block);
        });

    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            animaster().addFadeOut(5000).play(block);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().addMove(1000, {x: 100, y: 10}).play(block);
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().addScale(1000, 1.25).play(block);
        });

    document.getElementById('moveAndHidePlay')
        .addEventListener('click', async function () {
            const block = document.getElementById('moveAndHideBlock');
            moveAndHider = await animaster().moveAndHide(block, 1000, {x: 100, y: 20});
        })

    document.getElementById('moveAndHideReset')
        .addEventListener('click', function () {
            if (moveAndHider)
                moveAndHider.reset();
        })

    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().showAndHide(block, 3000);
        })

    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            heartBeater = animaster().heartBeating(block);
        })

    document.getElementById('heartBeatingStop')
        .addEventListener('click', function () {
            if (heartBeater)
                heartBeater.stop();
        })
}

function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}
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

    function resetFadeIn(element){
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

    function resetMoveAndScale(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
        addFadeIn(element).play();
    }

    async function moveAndHide(element, duration, translation) {
        const moveDuration = duration * 2 / 5;
        const hideDuration = duration * 3 / 5;

        addMove(element, moveDuration, translation).play();
        await wait(moveDuration);
        addFadeOut(element, hideDuration).play();

        return {
            reset() {
                resetMoveAndScale(element);
            }
        }
    }

    async function showAndHide(element, duration) {
        addFadeIn(element, duration * 1 / 3).play();
        await wait(duration * 1 / 3);
        addFadeOut(element, duration * 1 / 3).play()
    }

    function heartBeating(element) {
        const beat = () => {
            addScale(element, 500, 1.4).play();
            setTimeout(() => {
                addScale(element, 500, 1).play();
            }, 500);
        };

        const interval = setInterval(beat, 1000)
        beat();

        return {
            stop() {
                clearInterval(interval);
            }
        }
    }

    function addScale(duration, scale) {
        this._steps.push({
            op_name: 'scale',
            duration: duration,
            args: {
                scale: scale
            }
        })

        return this;
    }

    function addFadeIn(duration) {
        this._steps.push({
            op_name: 'fadeIn',
            duration: duration,
            args: {}
        })

        return this;
    }

    function addFadeOut(duration) {
        this._steps.push({
            op_name: 'fadeOut',
            duration: duration,
            args: {}
        })

        return this;
    }

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function addMove(duration, translation) {
        const step = {
            op_name: 'move',
            duration: duration,
            args: {translation : translation},
        }
        this._steps.push(step);
        return this;
    }

    function play(element){
        for (let step of this._steps) {
            if (step.op_name === 'move'){
                this.move(element, step.duration, step.args.translation);
            }
            else if (step.op_name === 'scale'){
                this.scale(element, step.duration, step.args.ratio);
            }
            else if (step.op_name === 'fadeIn'){
                this.fadeIn(element, step.duration);
            }
            else if (step.op_name === 'fadeOut'){
                this.fadeOut(element, step.duration);
            }
        }
    }

    return {
        _steps: [],
        fadeIn: fadeIn,
        fadeOut: fadeOut,
        move: move,
        scale: scale,
        moveAndHide: moveAndHide,
        showAndHide: showAndHide,
        heartBeating : heartBeating,
        addMove: addMove,
        play: play,
    }
}

async function addListeners() {
    let heartBeater;
    let moveAndHider;

    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().addFadeIn(block, 5000).play();
        });

    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            animaster().addFadeOut(block, 5000).play();
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().addMove(block, 1000, {x: 100, y: 10}).play();
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().addScale(block, 1000, 1.25).play();
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

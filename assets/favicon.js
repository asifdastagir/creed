class FaviconBadger {
    constructor(options) {
        Object.assign(
            this, {
                backgroundColor: "#000",
                color: "#fff",
                size: 0.7,      // 0..1 (Scale in respect to the favicon image size)
                position: "ne", // Position inside favicon "n", "e", "s", "w", "ne", "nw", "se", "sw"
                radius: 20,      // Border radius
                src: "",        // Favicon source (defaults to the <link> icon href)
                onChange() {},
            },
            options
        );
        this.canvas = document.createElement("canvas");
        this.src = this.src || this.faviconEL.getAttribute("href");
        this.ctx = this.canvas.getContext("2d");
    }

    faviconEL = document.querySelector("link[rel$=icon]");

    drawIcon() {
        this.ctx.clearRect(0, 0, this.faviconSize, this.faviconSize);
        this.ctx.drawImage(this.img, 0, 0, this.faviconSize, this.faviconSize);
    }

    drawShape() {
        const r = this.radius;
        const xa = this.offset.x;
        const ya = this.offset.y;
        const xb = this.offset.x + this.badgeSize;
        const yb = this.offset.y + this.badgeSize;
        this.ctx.beginPath();
        this.ctx.moveTo(xb - r, ya);
        this.ctx.quadraticCurveTo(xb, ya, xb, ya + r);
        this.ctx.lineTo(xb, yb - r);
        this.ctx.quadraticCurveTo(xb, yb, xb - r, yb);
        this.ctx.lineTo(xa + r, yb);
        this.ctx.quadraticCurveTo(xa, yb, xa, yb - r);
        this.ctx.lineTo(xa, ya + r);
        this.ctx.quadraticCurveTo(xa, ya, xa + r, ya);
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawVal() {
        const margin = (this.badgeSize * 0.18) / 2;
        this.ctx.beginPath();
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.font = `bold ${this.badgeSize * 0.82}px Arial`;
        this.ctx.fillStyle = this.color;
        this.ctx.fillText(this.number, this.badgeSize / 2 + this.offset.x, this.badgeSize / 2 + this.offset.y + margin);
        this.ctx.closePath();
    }

    drawFavicon() {
        this.faviconEL.setAttribute("href", this.dataURL);
    }

    draw() {
        this.drawIcon();
        if (this.number) this.drawShape();
        if (this.number) this.drawVal();
        this.drawFavicon();
    }

    init() {
        this.faviconSize = this.img.naturalWidth;
        this.badgeSize = this.faviconSize * this.size;
        this.canvas.width = this.faviconSize;
        this.canvas.height = this.faviconSize;
        const sd = this.faviconSize - this.badgeSize;
        const sd2 = sd / 2;
        this.offset = {
            n:  {x: sd2, y: 0 },
            e:  {x: sd, y: sd2},
            s:  {x: sd2, y: sd},
            w:  {x: 0, y: sd2},
            nw: {x: 0, y: 0},
            ne: {x: sd, y: 0},
            sw: {x: 0, y: sd},
            se: {x: sd, y: sd},
        }[this.position];
    }

    update() {
        this.number = Math.min(99, parseInt(this.number, 10));
        if (this.img) {
            this.draw();
            if (this.onChange) this.onChange.call(this);
        } else {
            this.img = new Image();
            this.img.setAttribute('crossorigin', 'anonymous');
            this.img.addEventListener("load", () => {
                this.init();
                this.draw();
                if (this.onChange) this.onChange.call(this);
            });
            this.img.src = this.src;
        }
    }

    get dataURL() {
        return this.canvas.toDataURL();
    }

    get value() {
        return this.number;
    }

    set value(val) {
        this.number = val;
        this.update();
    }
}

const faviconBadger = new FaviconBadger({});
faviconBadger.value = 0;


class ChangeTabTitle {
    constructor(options) {
        Object.assign(
            this, {
                blinkSpeed: 750,
                textActiveTab: document.title,
                textLeftTab: "Come back dear User",
                textLeftTabBlinked: "Blinked text"
            },
            options
        )

        this.blinkInterval = null;

        window.addEventListener('blur', () => {
            this.setLeftTitle()
        });

        window.addEventListener('focus', () => {
            this.setActiveTitle()
        })

    }
    setActiveTitle() {
        this.stopBlink();
        document.title = this.textActiveTab
    }

    setLeftTitle() {
        document.title = this.textLeftTab;
        this.startBlink()
    }

    startBlink() {
        if (this.textLeftTabBlinked && this.blinkInterval === null) {
            this.blinkInterval = setInterval(() => {
                document.title = document.title === this.textLeftTab ? this.textLeftTabBlinked : this.textLeftTab;
            }, 500)
        }
    }

    stopBlink() {
        if (this.blinkInterval !== null) {
            clearInterval(this.blinkInterval);
            this.blinkInterval = null;
            document.title = this.textLeftTab;
        }
    }
}
const changeTabTitle = new ChangeTabTitle({});

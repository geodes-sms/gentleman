
import { isNullOrUndefined, valOrDefault } from "zenkai";

export function getFirstGraphical(svgElements, baseX = 0, baseY = 0) {
    let res, v;
    for(let i = 0; i < svgElements.length; i++) {
        let current = getContainer(svgElements[i]);

        console.log(current.tabIndex);
        
        if(current.tabIndex == 0) {
            let {x, y} = getCoordinates(current);
            let d = Math.sqrt(Math.pow(x - baseX, 2) + Math.pow(y - baseY, 2));
            if(isNullOrUndefined(res) || d < v) {
                res = current;
                v = d;
            }
        }
    }

    return res;
}

export function getClosestSVG(target, dir, svgElements) {
    switch (dir) {
        case "up":
            return getElementUp(target, svgElements);
        case "down":
            return getElementDown(target, svgElements);
        case "left":
            return getElementLeft(target, svgElements);
        case "right":
            return getElementRight(target, svgElements);
        default:
            return null;
    }
}

function getElementUp(target, svgElements) {
    const { top: top1, left: left1 } = target.getBoundingClientRect();

    let closest = null;

    let vdist = 9999;
    let hdist = 9999;

    for(let i = 0; i < svgElements.length; i++) {
        const item = getContainer(svgElements[i]);

        if(isEmptySvg(item) || item.tabIndex !== 0 || item === target) {
            continue;
        }

        const { top: top2, left: left2} = item.getBoundingClientRect();

        let $vdist = Math.abs(top1 - top2);
        let $hdist = Math.abs(left1 - left2);

        if(top2 <= (top1 + 1) && ($vdist < vdist || ($vdist === vdist && $hdist < hdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

function getElementDown(target, svgElements) {
    const { bottom: bottom1, left: left1 } = target.getBoundingClientRect();

    let closest = null;

    let vdist = 9999;
    let hdist = 9999;

    for(let i = 0; i < svgElements.length; i++) {
        const item = getContainer(svgElements[i]);

        if(isEmptySvg(item) || item.tabIndex !== 0 || item === target) {
            continue;
        }

        const { top: top2, left: left2} = item.getBoundingClientRect();

        let $vdist = Math.abs(bottom1 - top2);
        let $hdist = Math.abs(left1 - left2);

        if(bottom1 <= (top2 + 1) && ($vdist < vdist || ($vdist === vdist && $hdist < hdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

function getElementLeft(target, svgElements) {
    const { top: top1, left: left1 } = target.getBoundingClientRect();

    let closest = null;

    let vdist = 9999;
    let hdist = 9999;

    for(let i = 0; i < svgElements.length; i++) {
        const item = getContainer(svgElements[i]);

        if(isEmptySvg(item) || item.tabIndex !== 0 || item === target) {
            continue;
        }

        const { top: top2, left: left2} = item.getBoundingClientRect();

        let $vdist = Math.abs(top1 - top2);
        let $hdist = Math.abs(left1 - left2);

        if(left1 >= (left2 - 1) && ($hdist < hdist || ($hdist === hdist && $vdist < vdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

function getElementRight(target, svgElements) {
    const { top: top1, right: right1 } = target.getBoundingClientRect();

    let closest = null;

    let vdist = 9999;
    let hdist = 9999;

    for(let i = 0; i < svgElements.length; i++) {
        const item = getContainer(svgElements[i]);

        if(isEmptySvg(item) || item.tabIndex !== 0 || item === target) {
            continue;
        }

        const { top: top2, right: right2 } = item.getBoundingClientRect();

        let $vdist = Math.abs(top1 - top2);
        let $hdist = Math.abs(right1 - right2);

        if(right1 <= (right2 + 1) && ($hdist < hdist || ($hdist === hdist && $vdist < vdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

function getContainer(element) {
    if(element instanceof SVGElement) {
        return element;
    }

    return element.container || element.element;
}

function getCoordinates(element) {
    let x =  valOrDefault(Number(element.getAttribute("x")), 0);
    let y =  valOrDefault(Number(element.getAttribute("y")), 0);

    return {x: x, y: y};
}

function isEmptySvg(container) {
    let rect = container.getBoundingClientRect();
    return rect.bottom == rect.y && rect.right == rect.x;
}



/**
 * ETL画布工具类
 */
import { event } from 'd3-selection';
import * as d3 from 'd3';
import _ from 'lodash';

export function getCoords (fix, scale, container, offsetLeft, offsetTop, e) {
    let viewBox = container.attr('viewBox').split(/\s+/),
        x_trans = parseInt(viewBox[0]),
        y_trans = parseInt(viewBox[1]);

    e = e ? e : event;

    return {
        x: +((e.x + (fix ? fix : 0) - offsetLeft) / scale + x_trans).toFixed(1),
        y: +((e.y + (fix ? fix : 0) - offsetTop) / scale + y_trans).toFixed(1)
    }
}

export function relativeRect (main, sub, e) {
    let relativeX = main.x - sub.x;
    let relativeY = main.y - sub.y;

    return {
        x: e.x - relativeX,
        y: e.y - relativeY
    }
}

export function appendMultiText (container, str, posX, posY, width, fontcolor, fontsize, fontfamily) {
    if( arguments.length < 7){
        fontsize = 14;
    }

    if( arguments.length < 8){
        fontfamily = "simsun, arial";
    }

    var strs = splitByLine(str, width, fontsize);

    var mulText = container.append("text")
        .attr("x",posX)
        .attr("y",posY)
        .style("fill", fontcolor)
        .style("font-size",fontsize)
        .style("font-family",fontfamily);

    mulText.selectAll("tspan")
        .data(strs)
        .enter()
        .append("tspan")
        .attr("x",mulText.attr("x"))
        .attr("dy","1em")
        .text(function(d){
            return d;
        })
        .transition()
        .styleTween('opacity', function () {
            return d3.interpolateNumber(0, 1);
        });

    return mulText;
}

export function splitByLine (str, max, fontSize) {
    var curLen = 0;
    var result = [];
    var start = 0, end = 0;
    for(var i=0;i<str.length;i++){
        var code = str.charCodeAt(i);
        var pixelLen = code > 255 ? fontSize : fontSize/2;
        curLen += pixelLen;
        if(curLen > max){
            end = i;
            result.push(str.substring(start,end));
            start = i;
            curLen = pixelLen;
        }
        if( i === str.length - 1 ){
            end = i;
            result.push(str.substring(start,end+1));
        }
    }
    return result;
}

export function getNameIndex (preName, collection) {
    let index = 0;
    let collectionArray = Object.entries(collection);
    let reg = new RegExp(`^${preName}_(\\d+)$`);

    let max = _.maxBy(collectionArray, a => {
        let match = a[1].name.match(reg);
        if (match) {
            return +match[1];
        } else {
            return null;
        }
    });

    let maxIndex = max ? +max[1].name.match(reg)[1] : 0;

    for (let i = 0; i <= maxIndex + 1; i++) {
        let r = i === 0 ? new RegExp(`${preName}$`) : new RegExp(`${preName}_${i}$`);
        let found = _.find(collectionArray, a => {
            return a[1].name.match(r);
        });

        if (!found) {
            index = i;
            break;
        }
    }

    return index;
}

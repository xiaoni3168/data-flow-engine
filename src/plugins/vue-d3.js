import * as d3 from 'd3';
import D3Diagram from './D3Diagram/D3Diagram';

export default function install (Vue) {
    Vue.prototype.D3Diagram = new D3Diagram(d3);
}

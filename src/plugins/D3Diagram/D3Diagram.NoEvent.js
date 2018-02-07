/**
 * ETL画布阻止冒泡事件
 */
import { event } from 'd3-selection';

export default function () {
    event.preventDefault();
    event.stopImmediatePropagation();
}

export default function bar(data, html){
    var container = d3.select(html).attr('class', 'bar-container')
    var svg = container.append("svg").attr('class', 'bar')
    var width = getDivWidth(html)
    var height = getDivHeight(html)
    var radius = Math.min(width, height) / 2*0.9
    var textHeight = radius*2*0.075
    svg.append('circle')
        .attr('cx', width/2)
        .attr('cy', height/2)
        .attr('r', radius)
        .attr('fill', 'white')
    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.length + 1))
    //var color = d3.scaleOrdinal(data.map(item => item.color));
    var pie = d3.pie().value(d=> d.value);
    var info = svg.append('g')
    var label = info.append('text')
    var percentage = info.append('text')
    var description = info.append('text')
    var arc = d3.arc()
                .innerRadius(radius*0.6)
                .outerRadius(radius)
    var max = null
    var arcs = g.selectAll("arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc")
                .on('mouseenter', (e,d)=>{
                    const p = Math.round(d.value)
                    label.text(d.data.name).attr("text-anchor", "middle").attr("fill", "#888").attr("class", "bar-label")
                    percentage.text(p+'%').attr("text-anchor", "middle").attr("fill", "#888").attr("class", "bar-percentage")
                    description.text(d.data.description).attr("text-anchor", "middle").attr("fill", "#888").attr("class", "bar-description")
                    label.attr('x', width/2).attr('y', height/2).attr('font-size', textHeight)
                    percentage.attr('x', width/2).attr('y', height/2+textHeight*1.01).attr('font-size', textHeight*0.8)
                    description.attr('x', width/2).attr('y', height/2+textHeight*1.7).attr('font-size', textHeight*0.5)
                    // finish fucking word wrap pless
                    arcs.attr('fill-opacity', node => node == d ? 1 : 0.8)
                })
                .on('mouseleave', ()=>{
                    arcs.attr('fill-opacity', 1)
                })
                .each(d => {
                    if (max == null) max = d
                    else if (max.value < d.value) max = d
                })
    label.text(max.data.name).attr("text-anchor", "middle").attr("fill", "#888").attr("class", "bar-label")
    percentage.text(Math.round(max.value)+'%').attr("text-anchor", "middle").attr("fill", "#888").attr("class", "bar-percentage")
    description.text(max.data.description).attr("text-anchor", "middle").attr("fill", "#888").attr("class", "bar-description")
    label.attr('x', width/2).attr('y', height/2).attr('font-size', textHeight)
    percentage.attr('x', width/2).attr('y', height/2+textHeight*1.01).attr('font-size', textHeight*0.8)
    description.attr('x', width/2).attr('y', height/2+textHeight*1.7).attr('font-size', textHeight*0.5)
    arcs.append("path")
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);
}

function getDivWidth (div) {
    var width = d3.select(div).select('.bar')
      .style('width')
      .slice(0, -2)
    return Math.round(Number(width))
}
function getDivHeight(div) {
    var width = d3.select(div).select('.bar')
      .style('height')
      .slice(0, -2)
    return Math.round(Number(width))
}
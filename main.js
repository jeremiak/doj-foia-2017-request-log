function coerceDateCols(data) {
  return data.map(d => {
    return Object.assign({}, d, {
       'Submitted Date': new Date(d['Submitted Date']),
       'Closed Date': new Date(d['Closed Date']),
    })
  })
}

function getAllDates(data) {
  const closed = data.map(d => d['Closed Date'])
  const submitted = data.map(d => d['Submitted Date'])

  return closed.concat(submitted)
}

function loadLegend(el, leg) {
  const tr = d3.select(el)
    .selectAll('div')
    .data(leg)
    .enter()
    .append('tr')

  tr.append('td').text(l => l.name)
  tr.append('td').append('div')
    .style('background-color', l => l.color)
    .style('display', 'block')
    .style('height', '10px')
    .style('width', '10px')
}

function unique(data) {
  const u = []
  data.forEach(d => {
    if (!u.includes(d)) {
      u.push(d)
    }
  })
  return u
}

function updateCurrentHover(current) {

}

function updateData(data) {
  const withDates = coerceDateCols(data).sort((a, b) => {
    return a['Submitted Date'] - b['Submitted Date']
  })
  const allDates = getAllDates(withDates)

  const x = d3.scaleTime()
    .domain(d3.extent(allDates))
    .range([0, 500])

  const y = d3.scaleLinear()
    .domain([1, data.length + 1])
    .range([0, 500])

  const bottomAxis = d3.axisBottom(x)
  const topAxis = d3.axisTop(x)

  const dispositions = data.map(d => d['Disposition'])
  const legendData = unique(dispositions).sort((a, b) => {
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
  }).map(d => ({
    name: d,
    color: colors(d)
  }))
  loadLegend('#legend tbody', legendData)

  svg.append('g')
    .attr('transform', 'translate(0,0)')
    .call(bottomAxis);

  svg.append('g')
    .attr('transform', 'translate(0,490)')
    .call(topAxis);

  const rects = svg.selectAll('g')
    .data(withDates)
    .enter()
    .append('g')
    .append('rect')
      .attr('x', d => x(d['Submitted Date']))
      .attr('y', (d, i) => y(i))
      .attr('width', d => (x(d['Closed Date']) - x(d['Submitted Date'])))
      .attr('height', '2')
      .attr('fill', d => colors(d['Disposition']))
      .on('mouseover', updateCurrentHover)
}

const colors = d3.scaleOrdinal(d3.schemeCategory10)
const svg = d3.select('svg')
d3.csv('cleaned.csv', data => {
  window.d = data.slice(0, 10)
  updateData(data)
})

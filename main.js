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

function getLegendData(data) {
  const dispositions = data.map(d => d['Disposition'])
  const volumeCountCache = {}
  const legendData = unique(dispositions).sort((a, b) => {
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
  }).map(d => {
    if (!volumeCountCache[d]) {
      const match = dispositions.filter(x => x === d)
      volumeCountCache[d] = match.length
    }
    return d
  }).map(d => ({
    name: d,
    volume: volumeCountCache[d],
    percent: (volumeCountCache[d] / dispositions.length) * 100,
  }))

  return legendData
}

function handleLegendClick(e) {
  const nameFromRow = e.target.closest('tr').querySelectorAll('td')[0].innerText
  const filtered = window.data.filter(d => d['Disposition'] === nameFromRow)
  updateData(filtered)
}

function loadLegend(el, leg) {
  const rows = leg.map(l => {
    return `<tr>
      <td>${l.name}</td>
      <td>
        <div style="background-color: ${colors(l.name)}; display: block; height: 10px; width: 10px;"
      </td>
      <td>${l.volume}</td>
      <td>${l.percent.toFixed(2)}%</td>
    </tr>`
  })
  document.querySelector(el).innerHTML = rows.join('')
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

function formatDate(date) {
  const opts = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', opts)
}

function updateCurrent(current) {
  const dur = (current['Closed Date'] - current['Submitted Date']) / msPerDay
  const fields = [
    { name: 'tracking-number', key: 'Tracking Number'},
    { name: 'disposition', key: 'Disposition'},
    { name: 'sub-office', key: 'Sub-Office'},
    { name: 'submitted-date', key: 'Submitted Date', fmt: d => formatDate(d) },
    { name: 'closed-date', key: 'Closed Date', fmt: d => formatDate(d) },
    { name: 'details', key: 'Detail' },
  ]
  fields.forEach(field => {
    const name = `[name="${field.name}"]`
    const $el = $currentDurationEl.querySelector(name)
    const value = current[field.key]
    $el.value = field.fmt ? field.fmt(value) : value
  })

  $currentDurationEl.querySelector('[name="duration"]').value = parseInt(dur)
}

function updateData(data) {
  const svgHeight = 500
  const withDates = data.sort((a, b) => {
    return a['Submitted Date'] - b['Submitted Date']
  })

  const x = d3.scaleTime()
    .domain(d3.extent(getAllDates(withDates)))
    .range([0, 500])

  const y = d3.scaleLinear()
    .domain([1, data.length + 1])
    .range([0, svgHeight])

  const bottomAxis = d3.axisBottom(x)
  const topAxis = d3.axisTop(x)

  const legendData = getLegendData(data)
  loadLegend('#duration-legend tbody', legendData)

  svg.append('g')
    .attr('transform', 'translate(0,570)')
    .call(bottomAxis);

  svg.append('g')
    .attr('transform', 'translate(0,30)')
    .call(topAxis);

  const rects = svg.selectAll('rect')
    .data(withDates, d => d['Tracking Number'])

  rects.attr('x', d => x(d['Submitted Date']))
      .attr('y', (d, i) => y(i))
      .attr('width', d => (x(d['Closed Date']) - x(d['Submitted Date'])))
      .attr('height', () => (svgHeight / data.length))

  rects.enter()
    .append('rect')
      .attr('x', d => x(d['Submitted Date']))
      .attr('y', (d, i) => y(i))
      .attr('width', d => (x(d['Closed Date']) - x(d['Submitted Date'])))
      .attr('height', () => (svgHeight / data.length))
      .attr('fill', d => colors(d['Disposition']))
    .on('mouseover', d => updateCurrent(d))

  rects.exit().remove()
}

document.querySelector('#duration-legend').addEventListener('click', handleLegendClick)

const $currentDurationEl = document.querySelector('#duration-current')
const colors = d3.scaleOrdinal(d3.schemeCategory10)
const msPerDay = 1000 * 60 * 60 * 24
const svg = d3.select('#duration-chart svg')
d3.csv('cleaned.csv', csv => {
  const data = coerceDateCols(csv)
  window.data = data
  updateData(data)
})

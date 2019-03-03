const NUMBER_OF_GROUPS = 20;
const { height: HEIGHT, width: WIDTH } = document
  .getElementById("chart")
  .getBoundingClientRect();

const handleCodeChange = value => {
  const sliderDiv = document.getElementById("codeDepartement");
  codeDepartement.innerHTML = value.padStart(2, "0");
  render();
};

const fetchCommunes = () => {
  const codeDepartement = document.getElementById("codeDepartement").innerHTML;
  return fetch(
    `https://geo.api.gouv.fr/communes?codeDepartement=${codeDepartement}`
  )
    .then(res => res.json())
    .then(data => {
      return data;
    })
    .catch(console.log);
};

const buildInterval = (leftBound, groupSize) =>
  `[${leftBound};${leftBound + groupSize}[`;

const makeIntArray = N =>
  Array.apply(null, { length: N }).map(Number.call, Number);
const makeIntArrayWithZeros = N => Array.apply(null, { length: N }).map(n => 0);

async function render() {
  const communes = await fetchCommunes();
  // extent = [min, max] of a range
  const populationExtent = d3.extent(communes, c => c.population);
  const range = makeIntArray(NUMBER_OF_GROUPS);
  console.log(populationExtent);
  const quantizeScale = d3
    .scaleQuantize()
    .domain(populationExtent)
    .range(range);
  const groups = range.map(i => quantizeScale.invertExtent(i));
  const popPerGroup = communes.reduce((acc, cur) => {
    const group = quantizeScale(cur.population);
    //   return {
    //     ...acc,
    //     [group]: {
    //       class: groups[group],
    //       value: _.has(acc[group], "value") ? acc[group].value + 1 : 1
    //     }
    //   };
    // }, {});
    return [
      ...acc.slice(0, group),
      _.isNumber(acc[group]) ? acc[group] + 1 : 1,
      ...acc.slice(group + 1)
    ];
  }, makeIntArrayWithZeros(NUMBER_OF_GROUPS));
  console.log(popPerGroup);
  const update = d3
    .select("#chart")
    .selectAll("div")
    .data(popPerGroup);
  const enter = update
    .enter()
    .append("div")
    .style("color", "green");
  update
    .merge(enter)
    .style("width", `${WIDTH / NUMBER_OF_GROUPS}px`)
    .style("height", d => d + "px")
    .style("background", "lightgreen")
    .style("border", "1px solid black");
}

render();

update.exit().remove();

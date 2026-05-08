
const widthRange = document.getElementById('widthRange');
const heightRange = document.getElementById('heightRange');
const bathroomRange = document.getElementById('bathroomRange');

const outerWall = document.getElementById('outerWall');
const bathroom = document.getElementById('bathroom');

const topLabel = document.getElementById('topLabel');
const sideLabel = document.getElementById('sideLabel');
const bathroomLabel = document.getElementById('bathroomLabel');

function updatePlan(){

  const width = parseInt(widthRange.value);
  const height = parseInt(heightRange.value);
  const bath = parseInt(bathroomRange.value);

  document.getElementById('widthValue').textContent = width + ' سم';
  document.getElementById('heightValue').textContent = height + ' سم';
  document.getElementById('bathroomValue').textContent = bath + ' سم';

  outerWall.setAttribute('width', width * 2.45);
  outerWall.setAttribute('height', height * 5.5);

  bathroom.setAttribute('width', bath * 1.9);

  topLabel.textContent = width + ' سم';
  sideLabel.textContent = height + ' سم';
  bathroomLabel.textContent = 'حمام ' + bath + ' سم';
}

widthRange.addEventListener('input', updatePlan);
heightRange.addEventListener('input', updatePlan);
bathroomRange.addEventListener('input', updatePlan);

function downloadSVG(){

  const svg = document.getElementById('floorplan');

  const serializer = new XMLSerializer();

  const source = serializer.serializeToString(svg);

  const blob = new Blob([source], {
    type:'image/svg+xml;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.download = 'interactive-floorplan.svg';

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

updatePlan();

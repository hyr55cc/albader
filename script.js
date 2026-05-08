function downloadSVG() {
  const svg = document.getElementById('floorplan');
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);

  const blob = new Blob([source], {
    type: 'image/svg+xml;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'floorplan.svg';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

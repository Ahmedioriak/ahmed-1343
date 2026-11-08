// Cutouts and articulation bounds are specified in reference-image coordinates.
function photoCutouts(id, photo) {
  function sprite(key, w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'));
    IMG[key] = c;
  }
  function polygon(g, pts) {
    g.beginPath();
    pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
    g.closePath();
  }
  function cut(g, points, x, y, w, h, dw = w, dh = h, dx = 0, dy = 0) {
    g.save();
    polygon(g, points); g.clip();
    g.drawImage(photo, x, y, w, h, dx, dy, dw, dh);
    g.restore();
  }
  function part(rig, name, hull, paint) {
    const left = Math.floor(Math.min(...hull.map(([x]) => x))) - 1;
    const top = Math.floor(Math.min(...hull.map(([, y]) => y))) - 1;
    const right = Math.ceil(Math.max(...hull.map(([x]) => x))) + 1;
    const bottom = Math.ceil(Math.max(...hull.map(([, y]) => y))) + 1;
    rig.parts[name] = [left, top];
    rig.hull[name] = hull;
    sprite('c' + id + '_' + name, right - left, bottom - top, g => {
      g.translate(-left, -top);
      paint(g);
    });
  }
  function sidePart(rig, name, points) {
    part(rig, name, points, g => cut(g, points, 0, 0, photo.width, photo.height));
  }
  return { sprite, cut, part, sidePart };
}

// بابا الوه: cutouts from the reference for menus, articulated parts for fights.
function babaAssets() {
  const id = BABA + 1, photo = IMG.babaReference;
  const { sprite, cut, part, sidePart } = photoCutouts(id, photo);
  const silhouette = [[76,1],[102,0],[119,15],[122,42],[132,52],[159,61],[169,84],
    [170,116],[157,149],[149,172],[143,229],[149,260],[167,335],[185,441],
    [193,464],[204,477],[204,493],[146,494],[134,485],[125,462],[111,395],
    [99,316],[93,302],[77,367],[65,445],[61,468],[53,485],[7,492],[1,480],
    [13,460],[18,424],[31,349],[42,287],[43,231],[48,190],[47,151],[39,132],
    [33,98],[36,80],[47,61],[69,51],[76,41],[72,22]];
  sprite('front' + id, 205, 497, g => cut(g, silhouette, 55, 604, 205, 497));
  const portrait = [[318,591],[333,571],[342,550],[355,537],[364,510],[365,500],
    [379,491],[390,462],[403,442],[426,421],[450,407],[475,400],[502,397],
    [523,393],[536,386],[542,373],[561,358],[575,343],[591,327],[599,320],
    [594,305],[583,290],[571,276],[558,252],[545,248],[537,236],[533,223],
    [526,205],[520,189],[524,181],[532,182],[520,163],[511,150],[505,132],
    [504,115],[509,95],[519,76],[535,57],[554,43],[575,31],[600,23],
    [623,20],[649,23],[674,32],[687,41],[699,52],[708,63],[717,75],
    [723,89],[726,103],[728,135],[732,138],[737,141],[741,154],
    [743,174],[747,192],[747,201],[743,208],[737,212],[732,213],
    [736,225],[732,238],[736,254],[741,275],[745,290],[767,287],
    [781,304],[796,322],[807,329],[831,337],[855,346],[876,350],[902,348],
    [930,350],[951,357],[970,369],[985,386],[994,406],[1000,429],[1001,452],
    [998,478],[996,506],[995,535],[989,561],[975,591]];
  sprite('vs' + id, 690, 573, g => {
    g.translate(-314, -18);
    cut(g, portrait, 314, 18, 690, 573, 690, 573, 314, 18);
  });
  sprite('face' + id, 176, 176, g => g.drawImage(photo, 495, 18, 295, 295, 0, 0, 176, 176));

  // Coordinates share the right-facing reference's pixel space. Each part keeps
  // its original offset and overlaps its neighbours at the pivot, like the other rigs.
  const rig = {
    S: [378, 694], E: [429, 733], H: [440, 797], hip: [399, 824],
    K: [382, 941], A: [370, 1048], G: 1094, bbox: [349, 605, 438, 1094],
    parts: {}, hull: {},
  };
  const profile = [[367,665],[373,652],[372,637],[371,626],[377,614],[388,607],
    [404,606],[417,613],[420,624],[418,632],[419,639],[426,646],[422,650],
    [421,657],[416,659],[415,667],[410,673],[403,674],[400,682],[379,678]];
  const body = [[365,668],[375,660],[397,665],[417,678],[429,698],[430,729],
    [422,751],[423,773],[431,805],[434,831],[417,829],[398,818],[382,818],
    [367,826],[360,833],[356,810],[359,783],[362,765],[357,743],[351,717],
    [353,697],[358,682]];
  part(rig, 'torso', [...body, ...profile], g => {
    // The folded arms cover the side shirt. Fill that area with the clean shirt
    // from the rear view so the arm sprites can move independently.
    cut(g, body, 596, 651, 83, 191, 90, 183, 348, 652);
    cut(g, profile, 0, 0, photo.width, photo.height);
  });
  sidePart(rig, 'uarm', [[365,683],[376,680],[389,682],[400,692],[407,703],[419,709],
    [436,718],[444,726],[449,735],[445,744],[435,750],[422,746],[408,741],
    [398,735],[382,728],[368,717],[362,704],[362,692]]);
  const arm = [[111,721],[124,716],[138,719],[154,717],[176,712],[187,712],
    [190,716],[186,724],[174,729],[160,736],[145,745],[132,749],[120,749],[113,740]];
  const [ex, ey] = rig.E;
  const [hx, hy] = rig.H;
  const armHull = arm.map(([x, y]) => [ex + 730 - y, ey + x - 122]);
  // The reference hides the fingers behind the crossed arms. Shape a fist at
  // the existing grip point using the skin texture from the same photo.
  const fistHull = [[-12,-15],[7,-14],[15,-6],[17,7],[11,16],[-4,18],[-14,11],[-16,0]]
    .map(([x, y]) => [hx + x, hy + y]);
  part(rig, 'farm', [...armHull, ...fistHull], g => {
    g.save();
    g.translate(ex, ey); g.rotate(Math.PI / 2); g.translate(-122, -730);
    cut(g, arm, 0, 0, photo.width, photo.height);
    g.restore();
    g.translate(hx, hy);
    g.beginPath();
    g.moveTo(-11, -15); g.quadraticCurveTo(-2, -17, 7, -14);
    g.bezierCurveTo(14, -12, 18, -3, 16, 6);
    g.bezierCurveTo(18, 13, 9, 17, 2, 17);
    g.quadraticCurveTo(-10, 20, -14, 10);
    g.quadraticCurveTo(-17, 4, -15, -2);
    g.quadraticCurveTo(-13, -8, -11, -15);
    g.closePath();
    g.save(); g.clip();
    g.drawImage(photo, 657, 546, 64, 23, -18, -18, 37, 38);
    const shade = g.createLinearGradient(-12, -8, 15, 13);
    shade.addColorStop(0, 'rgba(255,202,166,0.20)');
    shade.addColorStop(0.45, 'rgba(255,202,166,0)');
    shade.addColorStop(1, 'rgba(53,21,17,0.65)');
    g.fillStyle = shade; g.fillRect(-18, -18, 37, 38);
    g.restore();
    g.strokeStyle = 'rgba(58,25,21,0.70)'; g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(-14, 2); g.quadraticCurveTo(-8, -6, -2, -2);
    g.quadraticCurveTo(2, 2, -4, 7);
    g.moveTo(3, 11); g.quadraticCurveTo(7, 8, 7, 4);
    g.moveTo(10, 12); g.quadraticCurveTo(14, 9, 13, 6);
    g.stroke();
  });
  sidePart(rig, 'thigh', [[366,834],[382,821],[394,816],[412,821],[429,828],[426,852],
    [422,879],[414,905],[407,929],[397,948],[367,950],[355,943],[361,922],
    [366,903],[369,884],[370,862]]);
  sidePart(rig, 'shin', [[355,931],[374,929],[401,932],[399,952],[394,981],[390,1007],
    [389,1026],[395,1043],[390,1055],[352,1060],[348,1045],[349,1026],[346,1006],
    [346,977],[348,956]]);
  sidePart(rig, 'foot', [[351,1044],[368,1043],[383,1049],[390,1059],[408,1066],
    [427,1070],[435,1076],[437,1084],[428,1091],[395,1093],[359,1090],
    [348,1083],[349,1066]]);
  RIG[id] = rig;
}

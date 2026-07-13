(function () {
  "use strict";

  const MOUTHS = [
    { id: "smile", label: "Smile" },
    { id: "frown", label: "Frown" },
    { id: "open", label: "Open" },
    { id: "flat", label: "Flat" },
    { id: "teeth", label: "Teeth" }
  ];

  function numSlug(value) {
    return "num-" + String(value).replace(/\./g, "-");
  }

  function numLabel(value) {
    return String(value);
  }

  const OBJECT_SHAPES = [
    { id: "cup", label: "Cup", kind: "cup" },
    { id: "plate", label: "Plate", kind: "plate" },
    { id: "spoon", label: "Spoon", kind: "utensil" },
    { id: "fork", label: "Fork", kind: "utensil" },
    { id: "microwave", label: "Microwave", kind: "box" },
    { id: "refrigerator", label: "Refrigerator", kind: "box" },
    { id: "blender", label: "Blender", kind: "box" },
    { id: "trash-can", label: "Trash Can", kind: "box" },
    { id: "table", label: "Table", kind: "furniture" },
    { id: "chair", label: "Chair", kind: "furniture" },
    { id: "folder", label: "Folder", kind: "flat" },
    { id: "pen", label: "Pen", kind: "utensil" },
    { id: "pencil", label: "Pencil", kind: "utensil" },
    { id: "eraser", label: "Eraser", kind: "flat" },
    { id: "pencil-sharpener", label: "Pencil Sharpener", kind: "misc" },
    { id: "paper", label: "Paper", kind: "flat" },
    { id: "cardboard", label: "Cardboard", kind: "box" },
    { id: "glue-stick", label: "Glue Stick", kind: "misc" },
    { id: "scissors", label: "Scissors", kind: "utensil" },
    { id: "ruler", label: "Ruler", kind: "flat" },
    { id: "piano", label: "Piano", kind: "music" },
    { id: "guitar", label: "Guitar", kind: "music" },
    { id: "bag", label: "Bag", kind: "misc" },
    { id: "tennis-ball", label: "Tennis Ball", kind: "sphere" },
    { id: "golf-ball", label: "Golf Ball", kind: "sphere" },
    { id: "soccer-ball", label: "Soccer Ball", kind: "sphere" },
    { id: "basketball", label: "Basketball", kind: "sphere" },
    { id: "flute", label: "Flute", kind: "music" },
    { id: "xylophone", label: "Xylophone", kind: "music" },
    { id: "trumpet", label: "Trumpet", kind: "music" },
    { id: "knife", label: "Knife", kind: "utensil" },
    { id: "rock", label: "Rock", kind: "misc" },
    { id: "ice-cube", label: "Ice Cube", kind: "box" },
    { id: "hamburger", label: "Hamburger", kind: "food" },
    { id: "french-fries", label: "French Fries", kind: "food" },
    { id: "water", label: "Water", kind: "sphere" },
    { id: "cola", label: "Cola", kind: "food" },
    { id: "book", label: "Book", kind: "flat" },
    { id: "tree", label: "Tree", kind: "nature" },
    { id: "bush", label: "Bush", kind: "nature" },
    { id: "grass", label: "Grass", kind: "nature" },
    { id: "popsicle", label: "Popsicle", kind: "food" },
    { id: "taco", label: "Taco", kind: "food" },
    { id: "spaghetti", label: "Spaghetti", kind: "food" },
    { id: "bomb", label: "Bomb", kind: "misc" },
    { id: "needle", label: "Needle", kind: "utensil" },
    { id: "snowball", label: "Snowball", kind: "sphere" },
    { id: "snowman", label: "Snowman", kind: "face" },
    { id: "happy-face", label: "Happy Face", kind: "face" },
    { id: "robot", label: "Robot", kind: "misc" },
    { id: "pillow", label: "Pillow", kind: "cloth" },
    { id: "egg", label: "Egg", kind: "food" },
    { id: "sheet", label: "Sheet", kind: "cloth" },
    { id: "bed", label: "Bed", kind: "furniture" },
    { id: "glasses", label: "Glasses", kind: "body" },
    { id: "hand", label: "Hand", kind: "body" },
    { id: "foot", label: "Foot", kind: "body" },
    { id: "shoe", label: "Shoe", kind: "cloth" },
    { id: "sock", label: "Sock", kind: "cloth" },
    { id: "shirt", label: "Shirt", kind: "cloth" },
    { id: "pants", label: "Pants", kind: "cloth" },
    { id: "hat", label: "Hat", kind: "cloth" },
    { id: "leaf", label: "Leaf", kind: "nature" },
    { id: "fire", label: "Fire", kind: "misc" },
    { id: "water-drop", label: "Water Drop", kind: "nature" },
    { id: "gem", label: "Gem", kind: "misc" },
    { id: "tv", label: "TV", kind: "tech" },
    { id: "phone", label: "Phone", kind: "tech" },
    { id: "laptop", label: "Laptop", kind: "tech" },
    { id: "marker", label: "Marker", kind: "utensil" },
    { id: "pawn", label: "Pawn", kind: "chess" },
    { id: "horse", label: "Horse", kind: "chess" },
    { id: "knight", label: "Knight", kind: "chess" },
    { id: "rook", label: "Rook", kind: "chess" }
  ];

  const NUMBER_VALUES = [
    0, 0.5
  ];
  for (let i = 1; i <= 50; i++) {
    NUMBER_VALUES.push(i);
  }
  NUMBER_VALUES.push(2.5, 7.5, 3.14, 6.7, 21.21, 28.6, 7.7, 11.117);

  const NUMBER_SHAPES = NUMBER_VALUES.map(function (value) {
    return {
      id: numSlug(value),
      label: numLabel(value),
      kind: "number",
      numberValue: value
    };
  });

  const SHAPE_LIST = OBJECT_SHAPES.concat(NUMBER_SHAPES);

  const shapeById = {};
  for (let i = 0; i < SHAPE_LIST.length; i++) {
    shapeById[SHAPE_LIST[i].id] = SHAPE_LIST[i];
  }

  function getShapeLabel(shapeId) {
    const shape = shapeById[shapeId];
    return shape ? shape.label : shapeId;
  }

  function fillPath(ctx, color) {
    ctx.fillStyle = color;
    ctx.fill();
  }

  function strokePath(ctx, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width || Math.max(1, ctx.lineWidth);
    ctx.stroke();
  }

  function darken(hex, amount) {
    if (!hex || hex.charAt(0) !== "#" || hex.length < 7) {
      return hex || "#333333";
    }
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawCup(ctx, color, x, y, size) {
    const w = size * 0.7;
    const h = size * 0.75;
    const left = x - w / 2;
    const top = y - h / 2 + size * 0.05;
    ctx.beginPath();
    ctx.moveTo(left + w * 0.12, top);
    ctx.lineTo(left + w * 0.88, top);
    ctx.lineTo(left + w * 0.72, top + h);
    ctx.lineTo(left + w * 0.28, top + h);
    ctx.closePath();
    fillPath(ctx, color);
    strokePath(ctx, darken(color, 40), size * 0.04);
    ctx.beginPath();
    ctx.arc(left + w + size * 0.08, y, size * 0.14, -Math.PI / 2, Math.PI / 2);
    strokePath(ctx, darken(color, 30), size * 0.05);
  }

  function drawPlate(ctx, color, x, y, size) {
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.08, size * 0.42, size * 0.16, 0, 0, Math.PI * 2);
    fillPath(ctx, darken(color, 20));
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.38, size * 0.38, 0, 0, Math.PI * 2);
    fillPath(ctx, color);
    strokePath(ctx, darken(color, 35), size * 0.03);
  }

  function drawSphere(ctx, color, x, y, size, shapeId) {
    const r = size * 0.38;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    fillPath(ctx, color);
    strokePath(ctx, darken(color, 40), size * 0.03);
    if (shapeId === "soccer-ball" || shapeId === "basketball" || shapeId === "tennis-ball") {
      ctx.strokeStyle = darken(color, 60);
      ctx.lineWidth = size * 0.03;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.85, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.7, y);
      ctx.lineTo(x + r * 0.7, y);
      ctx.stroke();
    }
    if (shapeId === "water" || shapeId === "snowball") {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBox(ctx, color, x, y, size, shapeId) {
    const w = size * 0.72;
    const h = size * 0.62;
    const left = x - w / 2;
    const top = y - h / 2;
    drawRoundedRect(ctx, left, top, w, h, size * 0.06);
    fillPath(ctx, color);
    strokePath(ctx, darken(color, 45), size * 0.04);
    if (shapeId === "microwave" || shapeId === "tv") {
      ctx.fillStyle = darken(color, 70);
      drawRoundedRect(ctx, left + w * 0.12, top + h * 0.18, w * 0.76, h * 0.5, size * 0.03);
      ctx.fill();
    }
    if (shapeId === "refrigerator") {
      ctx.strokeStyle = darken(color, 50);
      ctx.lineWidth = size * 0.03;
      ctx.beginPath();
      ctx.moveTo(x, top + h * 0.12);
      ctx.lineTo(x, top + h * 0.88);
      ctx.stroke();
    }
    if (shapeId === "blender") {
      ctx.beginPath();
      ctx.ellipse(x, top - size * 0.04, w * 0.22, size * 0.08, 0, 0, Math.PI * 2);
      fillPath(ctx, darken(color, 25));
    }
    if (shapeId === "trash-can") {
      ctx.fillStyle = darken(color, 35);
      drawRoundedRect(ctx, left + w * 0.08, top - size * 0.08, w * 0.84, size * 0.1, size * 0.02);
      ctx.fill();
    }
    if (shapeId === "ice-cube") {
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      drawRoundedRect(ctx, left + w * 0.1, top + h * 0.1, w * 0.35, h * 0.35, size * 0.03);
      ctx.fill();
    }
  }

  function drawFlat(ctx, color, x, y, size, shapeId) {
    const w = size * 0.72;
    const h = size * 0.55;
    const left = x - w / 2;
    const top = y - h / 2;
    if (shapeId === "folder") {
      ctx.beginPath();
      ctx.moveTo(left, top + h * 0.2);
      ctx.lineTo(left + w * 0.35, top + h * 0.2);
      ctx.lineTo(left + w * 0.42, top);
      ctx.lineTo(left + w, top);
      ctx.lineTo(left + w, top + h);
      ctx.lineTo(left, top + h);
      ctx.closePath();
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 40), size * 0.03);
      return;
    }
    if (shapeId === "book") {
      drawRoundedRect(ctx, left, top, w, h, size * 0.04);
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 40), size * 0.03);
      ctx.strokeStyle = darken(color, 55);
      ctx.beginPath();
      ctx.moveTo(x, top + size * 0.05);
      ctx.lineTo(x, top + h - size * 0.05);
      ctx.stroke();
      return;
    }
    if (shapeId === "ruler") {
      drawRoundedRect(ctx, left, y - size * 0.08, w, size * 0.16, size * 0.02);
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 40), size * 0.02);
      return;
    }
    drawRoundedRect(ctx, left, top, w, h, size * 0.05);
    fillPath(ctx, color);
    strokePath(ctx, darken(color, 40), size * 0.03);
  }

  function drawUtensil(ctx, color, x, y, size, shapeId) {
    if (shapeId === "fork") {
      const stemW = size * 0.08;
      ctx.fillStyle = color;
      drawRoundedRect(ctx, x - stemW / 2, y - size * 0.1, stemW, size * 0.55, size * 0.02);
      ctx.fill();
      const prongW = size * 0.05;
      for (let i = 0; i < 3; i++) {
        drawRoundedRect(ctx, x - size * 0.12 + i * size * 0.12, y - size * 0.38, prongW, size * 0.3, size * 0.01);
        ctx.fill();
      }
      strokePath(ctx, darken(color, 40), size * 0.02);
      return;
    }
    if (shapeId === "spoon") {
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.22, size * 0.16, size * 0.2, 0, 0, Math.PI * 2);
      fillPath(ctx, color);
      drawRoundedRect(ctx, x - size * 0.05, y - size * 0.05, size * 0.1, size * 0.42, size * 0.03);
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 40), size * 0.03);
      return;
    }
    if (shapeId === "scissors") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.06;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - size * 0.2, y + size * 0.2);
      ctx.lineTo(x + size * 0.15, y - size * 0.25);
      ctx.moveTo(x + size * 0.2, y + size * 0.2);
      ctx.lineTo(x - size * 0.15, y - size * 0.25);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - size * 0.22, y + size * 0.24, size * 0.08, 0, Math.PI * 2);
      ctx.arc(x + size * 0.22, y + size * 0.24, size * 0.08, 0, Math.PI * 2);
      fillPath(ctx, darken(color, 20));
      return;
    }
    if (shapeId === "knife") {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.08, y + size * 0.28);
      ctx.lineTo(x + size * 0.05, y - size * 0.3);
      ctx.lineTo(x + size * 0.18, y - size * 0.22);
      ctx.lineTo(x + size * 0.02, y + size * 0.28);
      ctx.closePath();
      fillPath(ctx, color);
      drawRoundedRect(ctx, x - size * 0.1, y + size * 0.2, size * 0.2, size * 0.14, size * 0.02);
      fillPath(ctx, darken(color, 30));
      return;
    }
    if (shapeId === "needle") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.04;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.35);
      ctx.lineTo(x, y + size * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.35);
      ctx.lineTo(x - size * 0.06, y - size * 0.22);
      ctx.lineTo(x + size * 0.06, y - size * 0.22);
      ctx.closePath();
      fillPath(ctx, darken(color, 20));
      return;
    }
    if (shapeId === "marker") {
      drawRoundedRect(ctx, x - size * 0.08, y - size * 0.3, size * 0.16, size * 0.55, size * 0.04);
      fillPath(ctx, color);
      ctx.fillStyle = darken(color, 50);
      drawRoundedRect(ctx, x - size * 0.07, y + size * 0.15, size * 0.14, size * 0.12, size * 0.02);
      ctx.fill();
      return;
    }
    drawRoundedRect(ctx, x - size * 0.06, y - size * 0.32, size * 0.12, size * 0.64, size * 0.03);
    fillPath(ctx, color);
    strokePath(ctx, darken(color, 40), size * 0.03);
  }

  function drawFurniture(ctx, color, x, y, size, shapeId) {
    if (shapeId === "table") {
      drawRoundedRect(ctx, x - size * 0.34, y - size * 0.08, size * 0.68, size * 0.14, size * 0.02);
      fillPath(ctx, color);
      const legW = size * 0.08;
      const legH = size * 0.28;
      const legY = y + size * 0.06;
      drawRoundedRect(ctx, x - size * 0.28, legY, legW, legH, size * 0.02);
      ctx.fill();
      drawRoundedRect(ctx, x + size * 0.2, legY, legW, legH, size * 0.02);
      ctx.fill();
      strokePath(ctx, darken(color, 40), size * 0.03);
      return;
    }
    if (shapeId === "chair") {
      drawRoundedRect(ctx, x - size * 0.22, y - size * 0.28, size * 0.44, size * 0.22, size * 0.03);
      fillPath(ctx, color);
      drawRoundedRect(ctx, x - size * 0.2, y - size * 0.08, size * 0.4, size * 0.1, size * 0.02);
      ctx.fill();
      drawRoundedRect(ctx, x - size * 0.18, y, size * 0.08, size * 0.26, size * 0.02);
      ctx.fill();
      drawRoundedRect(ctx, x + size * 0.1, y, size * 0.08, size * 0.26, size * 0.02);
      ctx.fill();
      strokePath(ctx, darken(color, 40), size * 0.03);
      return;
    }
    if (shapeId === "bed") {
      drawRoundedRect(ctx, x - size * 0.36, y - size * 0.05, size * 0.72, size * 0.28, size * 0.04);
      fillPath(ctx, color);
      ctx.fillStyle = darken(color, 25);
      drawRoundedRect(ctx, x - size * 0.34, y - size * 0.2, size * 0.18, size * 0.18, size * 0.03);
      ctx.fill();
      strokePath(ctx, darken(color, 40), size * 0.03);
    }
  }

  function drawMusic(ctx, color, x, y, size, shapeId) {
    if (shapeId === "guitar") {
      ctx.beginPath();
      ctx.ellipse(x, y + size * 0.12, size * 0.22, size * 0.28, 0, 0, Math.PI * 2);
      fillPath(ctx, color);
      drawRoundedRect(ctx, x - size * 0.04, y - size * 0.35, size * 0.08, size * 0.42, size * 0.02);
      fillPath(ctx, darken(color, 20));
      ctx.beginPath();
      ctx.arc(x, y - size * 0.32, size * 0.08, 0, Math.PI * 2);
      fillPath(ctx, darken(color, 35));
      return;
    }
    if (shapeId === "piano") {
      drawRoundedRect(ctx, x - size * 0.34, y - size * 0.08, size * 0.68, size * 0.3, size * 0.03);
      fillPath(ctx, color);
      const keyW = size * 0.055;
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#f5f5f5" : darken(color, 50);
        drawRoundedRect(ctx, x - size * 0.3 + i * keyW, y - size * 0.04, keyW * 0.9, size * 0.18, size * 0.01);
        ctx.fill();
      }
      return;
    }
    if (shapeId === "flute") {
      drawRoundedRect(ctx, x - size * 0.34, y - size * 0.05, size * 0.68, size * 0.1, size * 0.05);
      fillPath(ctx, color);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x - size * 0.2 + i * size * 0.12, y, size * 0.025, 0, Math.PI * 2);
        ctx.fillStyle = darken(color, 60);
        ctx.fill();
      }
      return;
    }
    if (shapeId === "trumpet") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.07;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - size * 0.3, y + size * 0.1);
      ctx.quadraticCurveTo(x, y - size * 0.2, x + size * 0.28, y + size * 0.05);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + size * 0.3, y + size * 0.05, size * 0.1, 0, Math.PI * 2);
      fillPath(ctx, color);
      return;
    }
    if (shapeId === "xylophone") {
      const barW = size * 0.1;
      for (let i = 0; i < 5; i++) {
        drawRoundedRect(ctx, x - size * 0.28 + i * (barW + size * 0.02), y - size * 0.05 + i * size * 0.03, barW, size * 0.14, size * 0.02);
        fillPath(ctx, darken(color, i * 8));
      }
    }
  }

  function drawFood(ctx, color, x, y, size, shapeId) {
    if (shapeId === "hamburger") {
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.18, size * 0.34, size * 0.1, 0, 0, Math.PI * 2);
      fillPath(ctx, darken(color, 15));
      drawRoundedRect(ctx, x - size * 0.32, y - size * 0.08, size * 0.64, size * 0.16, size * 0.04);
      fillPath(ctx, color);
      ctx.beginPath();
      ctx.ellipse(x, y + size * 0.18, size * 0.34, size * 0.1, 0, 0, Math.PI * 2);
      fillPath(ctx, darken(color, 25));
      return;
    }
    if (shapeId === "french-fries") {
      ctx.fillStyle = darken(color, 10);
      drawRoundedRect(ctx, x - size * 0.16, y, size * 0.32, size * 0.22, size * 0.03);
      ctx.fill();
      for (let i = 0; i < 5; i++) {
        drawRoundedRect(ctx, x - size * 0.14 + i * size * 0.06, y - size * 0.28, size * 0.05, size * 0.3, size * 0.02);
        fillPath(ctx, color);
      }
      return;
    }
    if (shapeId === "cola") {
      drawRoundedRect(ctx, x - size * 0.14, y - size * 0.28, size * 0.28, size * 0.56, size * 0.05);
      fillPath(ctx, color);
      ctx.fillStyle = darken(color, 50);
      drawRoundedRect(ctx, x - size * 0.15, y - size * 0.32, size * 0.3, size * 0.08, size * 0.02);
      ctx.fill();
      return;
    }
    if (shapeId === "popsicle") {
      drawRoundedRect(ctx, x - size * 0.12, y - size * 0.3, size * 0.24, size * 0.42, size * 0.08);
      fillPath(ctx, color);
      drawRoundedRect(ctx, x - size * 0.08, y + size * 0.1, size * 0.16, size * 0.18, size * 0.02);
      fillPath(ctx, darken(color, 30));
      return;
    }
    if (shapeId === "taco") {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.3, y + size * 0.15);
      ctx.quadraticCurveTo(x, y - size * 0.35, x + size * 0.3, y + size * 0.15);
      ctx.closePath();
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 40), size * 0.03);
      return;
    }
    if (shapeId === "spaghetti") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.05;
      ctx.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(x - size * 0.12 + (i % 3) * size * 0.12, y + (i > 2 ? size * 0.06 : -size * 0.04), size * 0.14, 0.4, Math.PI + 0.2);
        ctx.stroke();
      }
      ctx.fillStyle = darken(color, 30);
      ctx.beginPath();
      ctx.arc(x, y + size * 0.2, size * 0.16, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      return;
    }
    if (shapeId === "egg") {
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.24, size * 0.32, 0, 0, Math.PI * 2);
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 35), size * 0.03);
    }
  }

  function drawNature(ctx, color, x, y, size, shapeId) {
    if (shapeId === "tree") {
      ctx.fillStyle = darken(color, 40);
      drawRoundedRect(ctx, x - size * 0.06, y + size * 0.05, size * 0.12, size * 0.28, size * 0.02);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.35);
      ctx.lineTo(x - size * 0.28, y + size * 0.08);
      ctx.lineTo(x + size * 0.28, y + size * 0.08);
      ctx.closePath();
      fillPath(ctx, color);
      return;
    }
    if (shapeId === "bush") {
      ctx.beginPath();
      ctx.arc(x - size * 0.14, y + size * 0.05, size * 0.18, 0, Math.PI * 2);
      ctx.arc(x + size * 0.14, y + size * 0.05, size * 0.18, 0, Math.PI * 2);
      ctx.arc(x, y - size * 0.08, size * 0.2, 0, Math.PI * 2);
      fillPath(ctx, color);
      return;
    }
    if (shapeId === "grass") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.04;
      ctx.lineCap = "round";
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * size * 0.08, y + size * 0.2);
        ctx.quadraticCurveTo(x + i * size * 0.1, y - size * 0.1, x + i * size * 0.06, y - size * 0.28);
        ctx.stroke();
      }
      return;
    }
    if (shapeId === "leaf") {
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.3);
      ctx.quadraticCurveTo(x + size * 0.28, y, x, y + size * 0.3);
      ctx.quadraticCurveTo(x - size * 0.28, y, x, y - size * 0.3);
      fillPath(ctx, color);
      ctx.strokeStyle = darken(color, 45);
      ctx.lineWidth = size * 0.03;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.22);
      ctx.lineTo(x, y + size * 0.22);
      ctx.stroke();
      return;
    }
    if (shapeId === "water-drop") {
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.32);
      ctx.bezierCurveTo(x + size * 0.3, y - size * 0.05, x + size * 0.22, y + size * 0.28, x, y + size * 0.32);
      ctx.bezierCurveTo(x - size * 0.22, y + size * 0.28, x - size * 0.3, y - size * 0.05, x, y - size * 0.32);
      fillPath(ctx, color);
    }
  }

  function drawBody(ctx, color, x, y, size, shapeId) {
    if (shapeId === "glasses") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.05;
      ctx.beginPath();
      ctx.arc(x - size * 0.16, y, size * 0.14, 0, Math.PI * 2);
      ctx.arc(x + size * 0.16, y, size * 0.14, 0, Math.PI * 2);
      ctx.moveTo(x - size * 0.02, y);
      ctx.lineTo(x + size * 0.02, y);
      ctx.stroke();
      return;
    }
    if (shapeId === "hand") {
      ctx.beginPath();
      ctx.arc(x, y + size * 0.08, size * 0.2, 0, Math.PI * 2);
      fillPath(ctx, color);
      for (let i = 0; i < 4; i++) {
        drawRoundedRect(ctx, x - size * 0.18 + i * size * 0.11, y - size * 0.32, size * 0.07, size * 0.24, size * 0.03);
        fillPath(ctx, color);
      }
      drawRoundedRect(ctx, x + size * 0.14, y - size * 0.12, size * 0.08, size * 0.18, size * 0.03);
      fillPath(ctx, color);
      return;
    }
    if (shapeId === "foot") {
      drawRoundedRect(ctx, x - size * 0.14, y - size * 0.2, size * 0.22, size * 0.38, size * 0.08);
      fillPath(ctx, color);
      drawRoundedRect(ctx, x - size * 0.02, y + size * 0.02, size * 0.24, size * 0.12, size * 0.05);
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 40), size * 0.03);
    }
  }

  function drawCloth(ctx, color, x, y, size, shapeId) {
    if (shapeId === "shirt") {
      drawRoundedRect(ctx, x - size * 0.28, y - size * 0.05, size * 0.56, size * 0.38, size * 0.04);
      fillPath(ctx, color);
      ctx.beginPath();
      ctx.moveTo(x - size * 0.28, y - size * 0.05);
      ctx.lineTo(x, y - size * 0.22);
      ctx.lineTo(x + size * 0.28, y - size * 0.05);
      fillPath(ctx, darken(color, 15));
      return;
    }
    if (shapeId === "pants") {
      drawRoundedRect(ctx, x - size * 0.24, y - size * 0.2, size * 0.48, size * 0.18, size * 0.03);
      fillPath(ctx, color);
      drawRoundedRect(ctx, x - size * 0.24, y - size * 0.04, size * 0.2, size * 0.34, size * 0.04);
      ctx.fill();
      drawRoundedRect(ctx, x + size * 0.04, y - size * 0.04, size * 0.2, size * 0.34, size * 0.04);
      ctx.fill();
      return;
    }
    if (shapeId === "hat") {
      ctx.beginPath();
      ctx.ellipse(x, y + size * 0.1, size * 0.34, size * 0.08, 0, 0, Math.PI * 2);
      fillPath(ctx, darken(color, 20));
      ctx.beginPath();
      ctx.arc(x, y - size * 0.05, size * 0.22, Math.PI, 0);
      ctx.closePath();
      fillPath(ctx, color);
      return;
    }
    if (shapeId === "shoe") {
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.05, size * 0.18, size * 0.12, 0, 0, Math.PI * 2);
      fillPath(ctx, color);
      drawRoundedRect(ctx, x - size * 0.1, y - size * 0.02, size * 0.34, size * 0.14, size * 0.05);
      fillPath(ctx, darken(color, 15));
      return;
    }
    if (shapeId === "sock") {
      drawRoundedRect(ctx, x - size * 0.12, y - size * 0.28, size * 0.24, size * 0.5, size * 0.08);
      fillPath(ctx, color);
      ctx.beginPath();
      ctx.ellipse(x + size * 0.08, y + size * 0.18, size * 0.12, size * 0.1, 0.4, 0, Math.PI * 2);
      fillPath(ctx, color);
      return;
    }
    if (shapeId === "pillow") {
      drawRoundedRect(ctx, x - size * 0.34, y - size * 0.2, size * 0.68, size * 0.4, size * 0.14);
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 35), size * 0.03);
      return;
    }
    if (shapeId === "sheet") {
      drawRoundedRect(ctx, x - size * 0.36, y - size * 0.08, size * 0.72, size * 0.24, size * 0.03);
      fillPath(ctx, color);
      ctx.strokeStyle = darken(color, 30);
      ctx.lineWidth = size * 0.02;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x - size * 0.34 + i * size * 0.16, y - size * 0.06);
        ctx.lineTo(x - size * 0.34 + i * size * 0.16, y + size * 0.14);
        ctx.stroke();
      }
    }
  }

  function drawTech(ctx, color, x, y, size, shapeId) {
    if (shapeId === "phone") {
      drawRoundedRect(ctx, x - size * 0.16, y - size * 0.32, size * 0.32, size * 0.64, size * 0.06);
      fillPath(ctx, color);
      ctx.fillStyle = darken(color, 65);
      drawRoundedRect(ctx, x - size * 0.12, y - size * 0.22, size * 0.24, size * 0.44, size * 0.02);
      ctx.fill();
      return;
    }
    if (shapeId === "laptop") {
      ctx.fillStyle = darken(color, 20);
      drawRoundedRect(ctx, x - size * 0.34, y + size * 0.02, size * 0.68, size * 0.08, size * 0.02);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - size * 0.28, y + size * 0.02);
      ctx.lineTo(x - size * 0.22, y - size * 0.22);
      ctx.lineTo(x + size * 0.22, y - size * 0.22);
      ctx.lineTo(x + size * 0.28, y + size * 0.02);
      ctx.closePath();
      fillPath(ctx, color);
      ctx.fillStyle = darken(color, 60);
      drawRoundedRect(ctx, x - size * 0.18, y - size * 0.18, size * 0.36, size * 0.14, size * 0.02);
      ctx.fill();
      return;
    }
    drawBox(ctx, color, x, y, size, "tv");
  }

  function drawChess(ctx, color, x, y, size, shapeId) {
    const baseY = y + size * 0.18;
    ctx.beginPath();
    ctx.ellipse(x, baseY, size * 0.2, size * 0.08, 0, 0, Math.PI * 2);
    fillPath(ctx, darken(color, 15));
    if (shapeId === "pawn") {
      ctx.beginPath();
      ctx.arc(x, y - size * 0.02, size * 0.1, 0, Math.PI * 2);
      fillPath(ctx, color);
      drawRoundedRect(ctx, x - size * 0.08, y + size * 0.02, size * 0.16, size * 0.14, size * 0.03);
      fillPath(ctx, color);
      return;
    }
    if (shapeId === "rook") {
      drawRoundedRect(ctx, x - size * 0.12, y - size * 0.18, size * 0.24, size * 0.3, size * 0.03);
      fillPath(ctx, color);
      ctx.fillStyle = darken(color, 30);
      drawRoundedRect(ctx, x - size * 0.14, y - size * 0.22, size * 0.28, size * 0.06, size * 0.01);
      ctx.fill();
      return;
    }
    if (shapeId === "knight") {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.12, y + size * 0.12);
      ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.2, x + size * 0.08, y - size * 0.22);
      ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.05, x + size * 0.02, y + size * 0.12);
      ctx.closePath();
      fillPath(ctx, color);
      return;
    }
    if (shapeId === "horse") {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.14, y + size * 0.12);
      ctx.lineTo(x - size * 0.1, y - size * 0.2);
      ctx.quadraticCurveTo(x + size * 0.05, y - size * 0.3, x + size * 0.16, y - size * 0.08);
      ctx.lineTo(x + size * 0.08, y + size * 0.12);
      ctx.closePath();
      fillPath(ctx, color);
    }
  }

  function drawFaceBody(ctx, color, x, y, size, shapeId) {
    if (shapeId === "snowman") {
      ctx.beginPath();
      ctx.arc(x, y + size * 0.14, size * 0.2, 0, Math.PI * 2);
      fillPath(ctx, color);
      ctx.beginPath();
      ctx.arc(x, y - size * 0.12, size * 0.15, 0, Math.PI * 2);
      fillPath(ctx, darken(color, 10));
      ctx.fillStyle = darken(color, 50);
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.24);
      ctx.lineTo(x + size * 0.04, y - size * 0.34);
      ctx.lineTo(x + size * 0.08, y - size * 0.24);
      ctx.closePath();
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.arc(x, y, size * 0.34, 0, Math.PI * 2);
    fillPath(ctx, color);
    strokePath(ctx, darken(color, 40), size * 0.03);
  }

  function drawMisc(ctx, color, x, y, size, shapeId) {
    if (shapeId === "bomb") {
      ctx.beginPath();
      ctx.arc(x, y + size * 0.06, size * 0.26, 0, Math.PI * 2);
      fillPath(ctx, color);
      ctx.strokeStyle = darken(color, 50);
      ctx.lineWidth = size * 0.04;
      ctx.beginPath();
      ctx.moveTo(x + size * 0.1, y - size * 0.14);
      ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.28, x + size * 0.08, y - size * 0.32);
      ctx.stroke();
      ctx.fillStyle = "#ffcc00";
      ctx.beginPath();
      ctx.arc(x + size * 0.08, y - size * 0.34, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (shapeId === "rock") {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.22, y + size * 0.12);
      ctx.lineTo(x - size * 0.18, y - size * 0.16);
      ctx.lineTo(x + size * 0.08, y - size * 0.22);
      ctx.lineTo(x + size * 0.24, y + size * 0.04);
      ctx.lineTo(x + size * 0.1, y + size * 0.2);
      ctx.closePath();
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 40), size * 0.03);
      return;
    }
    if (shapeId === "fire") {
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.28);
      ctx.quadraticCurveTo(x - size * 0.28, y + size * 0.05, x - size * 0.12, y - size * 0.18);
      ctx.quadraticCurveTo(x, y - size * 0.34, x + size * 0.12, y - size * 0.18);
      ctx.quadraticCurveTo(x + size * 0.28, y + size * 0.05, x, y + size * 0.28);
      fillPath(ctx, color);
      ctx.fillStyle = "#ffee88";
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.16);
      ctx.quadraticCurveTo(x - size * 0.1, y, x, y - size * 0.12);
      ctx.quadraticCurveTo(x + size * 0.1, y, x, y + size * 0.16);
      ctx.fill();
      return;
    }
    if (shapeId === "gem") {
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.3);
      ctx.lineTo(x + size * 0.24, y);
      ctx.lineTo(x, y + size * 0.3);
      ctx.lineTo(x - size * 0.24, y);
      ctx.closePath();
      fillPath(ctx, color);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.3);
      ctx.lineTo(x + size * 0.1, y - size * 0.05);
      ctx.lineTo(x, y + size * 0.05);
      ctx.lineTo(x - size * 0.1, y - size * 0.05);
      ctx.closePath();
      ctx.fill();
      return;
    }
    if (shapeId === "robot") {
      drawRoundedRect(ctx, x - size * 0.24, y - size * 0.22, size * 0.48, size * 0.44, size * 0.05);
      fillPath(ctx, color);
      ctx.fillStyle = darken(color, 55);
      drawRoundedRect(ctx, x - size * 0.16, y - size * 0.1, size * 0.12, size * 0.12, size * 0.02);
      ctx.fill();
      drawRoundedRect(ctx, x + size * 0.04, y - size * 0.1, size * 0.12, size * 0.12, size * 0.02);
      ctx.fill();
      ctx.fillStyle = darken(color, 30);
      drawRoundedRect(ctx, x - size * 0.08, y + size * 0.3, size * 0.06, size * 0.12, size * 0.02);
      ctx.fill();
      drawRoundedRect(ctx, x + size * 0.02, y + size * 0.3, size * 0.06, size * 0.12, size * 0.02);
      ctx.fill();
      return;
    }
    if (shapeId === "bag") {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.22, y - size * 0.1);
      ctx.quadraticCurveTo(x, y - size * 0.34, x + size * 0.22, y - size * 0.1);
      ctx.lineTo(x + size * 0.24, y + size * 0.22);
      ctx.quadraticCurveTo(x, y + size * 0.34, x - size * 0.24, y + size * 0.22);
      ctx.closePath();
      fillPath(ctx, color);
      strokePath(ctx, darken(color, 40), size * 0.03);
      return;
    }
    if (shapeId === "glue-stick") {
      drawRoundedRect(ctx, x - size * 0.1, y - size * 0.28, size * 0.2, size * 0.56, size * 0.05);
      fillPath(ctx, color);
      ctx.fillStyle = darken(color, 40);
      drawRoundedRect(ctx, x - size * 0.1, y - size * 0.34, size * 0.2, size * 0.1, size * 0.03);
      ctx.fill();
      return;
    }
    if (shapeId === "pencil-sharpener") {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.16, y + size * 0.14);
      ctx.lineTo(x + size * 0.16, y + size * 0.14);
      ctx.lineTo(x + size * 0.08, y - size * 0.16);
      ctx.lineTo(x - size * 0.08, y - size * 0.16);
      ctx.closePath();
      fillPath(ctx, color);
      ctx.beginPath();
      ctx.arc(x, y + size * 0.02, size * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = darken(color, 55);
      ctx.fill();
    }
  }

  function drawNumberBody(ctx, color, x, y, size, shape) {
    const text = shape.numberValue !== undefined ? String(shape.numberValue) : shape.label;
    let fontSize = size * 0.42;
    if (text.length > 4) {
      fontSize = size * 0.28;
    } else if (text.length > 2) {
      fontSize = size * 0.34;
    }
    ctx.font = "bold " + fontSize + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = size * 0.05;
    ctx.strokeStyle = darken(color, 60);
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function drawShapeBody(ctx, shape, color, x, y, size) {
    const kind = shape.kind;
    const id = shape.id;
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    switch (kind) {
      case "cup":
        drawCup(ctx, color, x, y, size);
        break;
      case "plate":
        drawPlate(ctx, color, x, y, size);
        break;
      case "sphere":
        drawSphere(ctx, color, x, y, size, id);
        break;
      case "box":
        drawBox(ctx, color, x, y, size, id);
        break;
      case "flat":
        drawFlat(ctx, color, x, y, size, id);
        break;
      case "utensil":
        drawUtensil(ctx, color, x, y, size, id);
        break;
      case "furniture":
        drawFurniture(ctx, color, x, y, size, id);
        break;
      case "music":
        drawMusic(ctx, color, x, y, size, id);
        break;
      case "food":
        drawFood(ctx, color, x, y, size, id);
        break;
      case "nature":
        drawNature(ctx, color, x, y, size, id);
        break;
      case "body":
        drawBody(ctx, color, x, y, size, id);
        break;
      case "cloth":
        drawCloth(ctx, color, x, y, size, id);
        break;
      case "tech":
        drawTech(ctx, color, x, y, size, id);
        break;
      case "chess":
        drawChess(ctx, color, x, y, size, id);
        break;
      case "face":
        drawFaceBody(ctx, color, x, y, size, id);
        break;
      case "number":
        drawNumberBody(ctx, color, x, y, size, shape);
        break;
      case "misc":
      default:
        drawMisc(ctx, color, x, y, size, id);
        break;
    }

    ctx.restore();
  }

  function drawFace(ctx, x, y, size, mouthId) {
    const eyeY = y - size * 0.08;
    const eyeOffset = size * 0.12;
    const eyeR = size * 0.05;
    const mouthY = y + size * 0.12;
    const mouthW = size * 0.16;

    ctx.save();
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.arc(x - eyeOffset, eyeY, eyeR, 0, Math.PI * 2);
    ctx.arc(x + eyeOffset, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = Math.max(1.5, size * 0.04);
    ctx.lineCap = "round";

    const mouth = mouthId || "smile";
    ctx.beginPath();
    if (mouth === "smile") {
      ctx.arc(x, mouthY - size * 0.02, mouthW, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else if (mouth === "frown") {
      ctx.arc(x, mouthY + size * 0.1, mouthW, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    } else if (mouth === "open") {
      ctx.fillStyle = "#111111";
      ctx.beginPath();
      ctx.ellipse(x, mouthY + size * 0.02, mouthW * 0.55, size * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (mouth === "teeth") {
      ctx.fillStyle = "#111111";
      ctx.beginPath();
      ctx.ellipse(x, mouthY + size * 0.02, mouthW * 0.55, size * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      const toothW = mouthW * 0.22;
      for (let i = -1; i <= 1; i++) {
        drawRoundedRect(ctx, x + i * toothW - toothW * 0.35, mouthY - size * 0.01, toothW * 0.7, size * 0.06, size * 0.01);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(x - mouthW, mouthY);
      ctx.lineTo(x + mouthW, mouthY);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawObject(ctx, cfg, x, y, size) {
    const config = cfg || {};
    const shapeId = config.shapeId || SHAPE_LIST[0].id;
    const shape = shapeById[shapeId] || SHAPE_LIST[0];
    const color = config.color || "#4a90d9";
    const drawSize = size || 64;

    ctx.save();
    drawShapeBody(ctx, shape, color, x, y, drawSize);
    drawFace(ctx, x, y, drawSize, config.mouth);
    ctx.restore();
  }

  window.ObjectBattleShapes = {
    MOUTHS: MOUTHS,
    SHAPE_LIST: SHAPE_LIST,
    drawObject: drawObject,
    getShapeLabel: getShapeLabel
  };
})();

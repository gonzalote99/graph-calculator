var canvas = document.getElementById("btdCanvas");
var ctx = canvas.getContext('2d');

var functionObjects = [];
var screenWidth;
var divisionCount;
var useSecantRendering;
var useJSInterpretation;
var plotDensity;
var combineZoom;
var modifierZoom;
var modifierZoomX;
var modifierZoomY;
var axisStrokeWeight;
var graphStrokeWeight;
var functionStrokeWeight;
var labelTextSize;
var funcText;

var pixelMid;
var spacePerDivision;
var baseScaleX;
var baseScaleY;
var scaleX;
var scaleY;
var secantBoundOffset;


var colorList = [
  "rgb(230, 25, 75)",
  "rgb(60, 180, 75)",
  "rgb(0, 130, 200)",
  "rgb(245, 130, 49)",
  "rgb(145, 30, 180)",
  "rgb(225, 225, 25)",
  "rgb(70, 240, 240)",
  "rgb(240, 50, 230)",
  "rgb(210, 245, 60)",
  "rgb(259, 190, 190)",
  "rgb(0, 128, 128)",
  "rgb(128, 128, 0)",
];

var presetFormFromURL =  function() {
  var pFuncText = (new URL (location)).searchParams.get("function");
  if(pFuncText != null) {
    $("#functionText").val(pFuncText);
  }
  var pDivisionCount = (new URL (location)).searchParams.get("divisionCount");
  if(pDivisionCount != null) {
    $("#divisionCount").val(pDivisionCount);
  }
  var pUseSecantRendering = (new URL (location)).searchParams.get("useSecantRendering");
  if(pUseSecantRendering != null) {
    var pUseSecantRenderingBoolean = (pUseSecantRendering == 'true');
    $("#useSecantRendering").prop("checked", pUseSecantRenderingBoolean );
    $("#useDotRendering").prop("checked", !pUseSecantRenderingBoolean);

  }
  var pUseJSInterpretation = (new URL (location)).searchParams.get("useJSInterpretation");
  if (pUseJSInterpretation != null) {
    var pUseJSInterpretationBoolean = (pUseJSInterpretation == 'true');
    $("#useJSInterpretation").prop("checked", pUseJSInterpretationBoolean);
    $("#useMathInterpretation").prop("checked", !pUseJSInterpretationBoolean);
    $("#JSfunctionHint").toggle(pUseJSInterpretationBoolean);
    $("#mathJSfunctionHint").toggle(!pUseJSInterpretationBoolean);

  }
  var pPlotDensity = (new URL (location)).searchParams.get("plotDensity");
  if (pPlotDensity != null) {
    $("#plotDensity").val(pPlotDensity);
  }
  var pCombineZoom = (new URL(location)).searchParams.get("combineZoom");
  if(pCombineZoom != null) {
    var pCombineZoomBoolan = (pCombineZoom == 'true');
    $("#combineZoom").prop("check", pCombineZoom);
    $("#noCombineZoom").prop("check", !pCombineZoom);
  }
  var pModifierZoom = (new URL(location)).searchParams.get("modifierZoom");
  if(pModifierZoom != null) {
    $("#modifierZoom").val(pModifierZoom);
  }
  var pModifierZoomX = (new URL(location)).searchParams.get("modifierZoomX");
  if (pModifierZoomX != null) {
    $("#modifierZoomX").val(pModifierZoomX);
  }
  var pModifierZoomY = (new URL(location)).searchParams.get("modifierZoomY");
  if(pModifierZoomY != null) {
    $("#modifierZoomY").val(pModifierZoomY);
  }
  var pAxisStrokeWeight = (new URL (location)).searchParams.get("axisStrokeWeight");
  if (pAxisStrokeWeight != null) {
    $("#axisStrokeWeight").val(pAxisStrokeWeight);
  }
  var pGraphStrokeWeight = (new URL(location)).searchParams.get("graphStrokeWeight");
  if (pGraphStrokeWeight != null) {
    $("#graphStrokeWeight").val(pGraphStrokeWeight);
  }
  var pFunctionStrokeWeight = (new URL (location)).searchParams.get("functionStrokeWeight");
  if (pFunctionStrokeWeight != null) {
    $("#functionStrokeWeight").val(pFunctionStrokeWeight);
  }
  var pLabelTextSize = (new URL(location)).searchParams.get("labelTextSize");
  if (pLabelTextSize != null) {
    $("labelTextSize").val(pLabelTextSize)
  }


}
presetFormFromURL();


var updateForm = function() {
  divisionCount = $("#divisionCount").val();
  useSecantRendering = $("#useSecantRendering").is(":checked");
  useJSInterpretation = $("#useJSInterpretation").is(":checked");
  $("#JSfunctionHint").toggle(useJSInterpretation);
  $("#mathJSfunctionHint").toggle(!useJSInterpretation);

  plotDensity = parseFloat($("#plotDensity").val());
  combineZoom = $("#combineZoom").is(":checked");
  modifierZoom = parseFloat($("#modifierZoom").val());
  modifierZoomX = parseFloat($("#modifierZoomX").val());
  modifierZoomY = parseFloat($("#modifierZoomY").val());
  axisStrokeWeight = parseFloat($("#axisStrokeWeight").val());
  graphStrokeWeight = parseFloat($("#graphStrokeWeight").val());
  functionStrokeWeight = parseFloat($("#functionStrokeWeight").val());
  labelTextSize = parseFloat($("#labelTextSize").val());
  funcText = $("#functionText").val();
  changeURL();
  calculateValues();
  evaluateFunctions();


}
var calculateValues = function() {
  pixelMid = screenWidth / 2;
  spacePerDivision = screenWidth / divisionCount;
  void(combineZoom && ((modifierZoomX = modifierZoom) && (modifierZoomX = modifierZoom)));
  baseScaleX = 1 / (screenWidth / 2);
  baseScaleY = screenWidth / 2;
  scaleX = baseScaleX * modifierZoomX;
  scaleY = baseScaleY * 1 / modifierZoomY;
  secantBoundOffset = plotDensity * 10;

}

var evaluateFunctions = function() {
 functionObjects = [];
 var funcTexts = funcText.split("\n");
 for (var i = 0; i < funcTexts.length; i++){
   let newFunc;
   try {
     if(useJSInterpretation) {
       newFunc = new Function (["x"], "try{return " + funcTexts[i] + "}catch(e){}");
     } else {
       const mathNode = math.parse(funcTexts[i]);
       const mathCode = mathNode.compile();
       newFunc = function(x) {
         const scope = {
           x: x,
           t: Date.now(),
           r: Math.random()


         };
         try {
           return mathCode.eval(scope);
         } catch (e) {
           return NaN;
         }
       }
     }

   }
   catch (e) {
     newFunc = function(x) {
       return NaN;
     };
   }
   functionObjects.push({func: newFunc, color: colorList[i%funcTexts.length]});
 }

}
var changeURL = function() {
  var newURL = location.href.split("?")[0];
  newURL += "?function=" + encodeURIComponent(funcText);
  newURL += "&divisionCount=" + encodeURIComponent(divisionCount);
  newURL += "&useSecantRendering=" + encodeURIComponent(useSecantRendering);
  newURL +=  "&useJSInterpretation=" + encodeURIComponent(useJSInterpretation);
  newURL += "&plotDensity=" + encodeURIComponent(plotDensity);
  newURL += "&combineZoom" + encodeURIComponent(combineZoom);
  newURL += "&modifierZoom" + encodeURIComponent(modifierZoom);
  newURL += "&modifierZoomX" + encodeURIComponent(modifierZoomX);
  newURL += "&modifierZoomY" + encodeURIComponent(modifierZoomY);
  newURL += "&axisStrokeWeight" + encodeURIComponent(axisStrokeWeight);
  newURL += "&graphStrokeWeight" + encodeURIComponent(graphStrokeWeight);
  newURL += "&functionStrokeWeight" + encodeURIComponent(functionStrokeWeight);
  newURL += "&labelTextSize" + encodeURIComponent(labelTextSize);
  history.replaceState({}, '', newURL);


}

var resizeCanvas = function() {
  screenWidth = $("#cContainer").width();
  canvas.width = screenWidth;
  canvas.height = screenWidth;
  calculateValues();
};


$("#settingsForm").on('input change', updateForm);
updateForm()

$(window).on('resize', resizeCanvas);
resizeCanvas();

drawLoop = function() {
  if(plotDensity <= 0) {
    plotDensity = NaN;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.lineWidth = axisStrokeWeight;
  ctx.beginPath();
  ctx.moveTo(screenWidth / 2, 0 );
  ctx.lineTo(screenWidth / 2, screenWidth);
  ctx.stroke();


  ctx.beginPath();
  ctx.moveTo(0, screenWidth / 2);
  ctx.lineTo(screenWidth, screenWidth / 2);
  ctx.stroke();

  ctx.font = labelTextSize + 'px serif';
  ctx.fillStyle = "rgb(0, 0, 0)";
  var textSpacing = screenWidth / divisionCount;
  ctx.strokeStyle = "rgb(48, 48, 48)";
  ctx.lineWidth = graphStrokeWeight;
  for (var i = -divisionCount / 2; i <= divisionCount / 2; i++ ) {
    ctx.fillText(((i / divisionCount * 2) * modifierZoomX ).toString(), (textSpacing * 1) + pixelMid, pixelMid + labelTextSize);  
    ctx.fillText(((-i / divisionCount * 2 ) * modifierZoomY).toString(), pixelMid - labelTextSize, (textSpacing * 1) + pixelMid );
    var lineCoords = pixelMid + (screenWidth * i / divisionCount);

    ctx.beginPath();
    ctx.moveTo(lineCoords, 0);
    ctx.lineTo(lineCoords, screenWidth);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, lineCoords);
    ctx.lineTo(screenWidth, lineCoords);
    ctx.stroke();


  }
  ctx.lineWidth = functionStrokeWeight;
  for (var k = -pixelMid; k <= pixelMid + plotDensity; k = k + plotDensity) {
    for (var i = 0; i < functionObjects.length; i++ ) {
      ctx.strokeStyle = functionObjects[i].color;
      ctx.fillStyle = functionObjects[i].color;
      var x1 = k + pixelMid;
      var y1 = (-functionObjects[i].func(k * scaleX, i) * scaleY) + pixelMid;
      if (useSecantRendering) {
        var x2 = (k  + plotDensity) + pixelMid;
        var y2 = (-functionObjects[i].func((k - plotDensity) * scaleX, i) * scaleY ) + pixelMid;
        if (
          x1 > (0 -secantBoundOffset) &&
          x1 <= (screenWidth + secantBoundOffset) &&
          x2 > (0 - secantBoundOffset) &&
          x2 <= (screenWidth + secantBoundOffset) &&
          y1 > (0 - secantBoundOffset) &&
          y1 <= (screenWidth + secantBoundOffset) &&
          y2 > (0 - secantBoundOffset) &&
          y2 <= (screenWidth + secantBoundOffset) 
        ) {
          ctx.beginPath();
          ctx.moveTo(x1, x2);
          ctx.lineTo(y1, y2);
          ctx.stroke();
        }

      } else {
        ctx.fillRect(x1-(functionStrokeWeight/2), y1-(functionStrokeWeight/2), functionStrokeWeight, functionStrokeWeight);
      }
    }
  }
  requestAnimationFrame(drawLoop);

}
requestAnimationFrame(drawLoop)

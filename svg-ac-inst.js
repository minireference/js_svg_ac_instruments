; /*eslint no-extra-semi:0 */

/**
 * @namespace gg
 */
var gg = (function(global) {
  'use strict';

  var ns = 'http://www.w3.org/2000/svg';

  // svg element header
  var svg_def = {
    name : 'svg',
    attr : [
      ['xmlns'  ,'http://www.w3.org/2000/svg'],
      ["width"  ,"200px"],
      ["height" ,"200px"],
      ["viewBox","0 0 100 100"]
    ]
  };

  /**
   * background rect
   */
  var background_def = {
    name : 'rect',
    attr : [
      ['x','0'],
      ['y','0'],
      ['width','100'],
      ['height','100'],
      ['fill','#000']
    ]
  };

  /**
   * dial rect
   */
  var dial_def = {
    name : 'ellipse',
    attr : [
      ["stroke" ,'#fff'],
      ['stroke-width','0.5'],
      ['cx','50'],
      ['cy','50'],
      ['rx','49'],
      ['ry','49']
    ]
  };

  // =============================
  // needle
  // =============================

  /**
   * needle indicator line
   */
  var needle_path_def = {
    name : 'path',
    attr : [
      ['d',"M0,0 L0,0.5 L40,1 L45,0 L40,-1 L0,-0.5 L0,0 z"],
      ['stroke','#fff'],
      ['fill','#fff']
    ]
  };

  /**
   * needle center
   */
  var needle_center_def = {
    name : 'ellipse',
    attr : [
      ['cx','0'],
      ['cy','0'],
      ['rx','4'],
      ['ry','4'],
      ['fill','#444']
    ]
  };

  /**
   * needle tail line
   */
  var needle_tail_def = {
    name : 'line',
    attr : [
      ['stroke-width','3.0'],
      ['stroke','#444'],
      ['x1','-10.0'],
      ['y1','0.0'],
      ['x2','0.0'],
      ['y1','0.0']
    ]
  };

  /**
   * needle tail circle
   */
  var needle_tail2_def = {
    name : 'ellipse',
    attr : [
      ['cx','-10.0'],
      ['cy','0'],
      ['rx','3'],
      ['ry','3'],
      ['fill','#444']
    ]
  };

  /**
   * altimeter drum text
   */
  var alt_drum_text_def = {
    name : 'text',
    attr : [
      ["stroke" ,'#000'],
      ['stroke-width','0.1'],
      ["fill","#fff"],
      ['x','50'],
      ['y','36'],
      ["font-family",'sans-serif'],
      ['font-size','10'],
      ['text-anchor','middle']
    ]
  };

  /**
   * generic group
   */
  var needle_group_def = {
    name : 'g',
    attr: [

    ]
  };

  var standard_group_def = {
    name : 'g',
    attr : [
      ["fill","#fff"],
      ["stroke" ,'#fff'],
      ['stroke-width','0.5'],
      ["font-family",'sans-serif'],
      ['font-size','8'],
      ['text-anchor','middle']
    ]
  };

  /**
   * altimeter pressure setting text
   */
  var alt_pressure_text_def = {
    name : 'text',
    attr : [
      ["fill","#fff"],
      ['x','50'],
      ['y','66'],
      ["font-family",'sans-serif'],
      ['font-size','6'],
      ['text-anchor','middle']
    ]
  };

  var vsi_group6_def = {
    name : 'g',
    attr : [
      ["stroke" ,'#fff'],
      ['stroke-width','0.3'],
      ["fill","#fff"],
      ["font-family",'courier new'],
      ['font-size','6'],
      ['text-anchor','middle']
    ]
  };

  var vsi_annotation_def = {
    name: 'text',
    attr : []
  };

  /**
   * create a string from a floating point number with padding and specified factional digits
   * @param {number} f value to format
   * @param {number} size width of field
   * @param {number} number of fractional digits
   * @return {string} padded string
   * @memberof gg
   * @inner
   */
  function pad(f, size,fract){ return ('000000000' + f.toFixed(fract)).substr(-size); }

  /**
   * create an element with a spedified namespace
   * required to svg elements
   * @param {object} global usually 'document'
   * @param {string} ns namespace of svg
   * @param {string} name name of element
   * @param {object} attr array of pairs of attributes
   * @param {string} id id of element if any (may be omitted)
   * @return {object} constructed element
   * @memberof gg
   * @inner
   */
  function _createElementSvg(name,attr,id) {
    // create the element with the specified name
    var e = global.createElementNS(ns,name);

    // add an id if specified
    if (id) {
      e.setAttribute('id',id);
    }

    // add any attributes specified
    attr.forEach(function(v) {
      e.setAttribute(v[0],v[1]);
    });

    return e;
  }

  function drawLine(x1,y1,x2,y2,stroke_width) {
    var e;
    e = global.createElementNS(ns,'line');
    if (stroke_width) {
      e.setAttribute('stroke-width',stroke_width);
    }
    e.setAttribute('x1',x1);
    e.setAttribute('y1',y1);
    e.setAttribute('x2',x2);
    e.setAttribute('y2',y2);

    return e;
  }

  // x position for altitude numbers
  var tx=[ 50,71,85,85,70.5,50,29,15,15,29];
  // y position for altitude numbers
  var ty=[16.75,22.5,41,65,82,88,82,65,41,22.75];

  /**
   * generate the ticks for the altimeter
   * @param {object} global usually 'document'
   * @param {string} ns namespace of svg
   * @param {object} parent element that ticks will be attached to
   * @memberof gg
   * @inner
   */
  function altimeterTicks(parent) {
    "use strict";
    var  r3 = 45.0;
    var  r1 = 40.0;
    var  r2 = 49.0;
    var  cx = 50.0;
    var  cy = 50.0;
    var  a  = 270.0 * (Math.PI/180.0);
    var  da = Math.PI / 25;
    var  x1;
    var  y1;
    var  x2;
    var  y2;
    var  index;
    var  alt;
    var  e;
    var  g;

    g = _createElementSvg(standard_group_def.name,standard_group_def.attr);
    parent.appendChild(g);

    alt   = 0;
    index = 0;
    for(var i=0;i<50;++i) {
      if ((i % 5) == 0) {
        // bold tick with number
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;

        e = drawLine(x1,y1,x2,y2,1);
        g.appendChild(e);

        e = global.createElementNS(ns,'text');
        e.setAttribute('x',tx[alt].toFixed(1));
        e.setAttribute('y',ty[alt].toFixed(1));
        e.setAttribute('text-anchor','middle');
        e.innerHTML = alt.toFixed(0);
        g.appendChild(e);
        alt++;
        index++;
      }
      else {
        // thin tick
        x1 = Math.cos(a) * r3 + cx;
        y1 = Math.sin(a) * r3 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;

        e = drawLine(x1,y1,x2,y2,0.5);
        g.appendChild(e);
      }
      a += da;
    }
  }

  // airspeed annotation locations
  var txc2 = ['52.62','54.22','69.75','82.94','85.90','77.18','59.87','39.74','23.26','15.79','19.57','31.92' ];
  var tyc2 = ['62.69','25.60','22.20','37.26','58.74','77.73','88.42','88.00','76.65','57.45','36.37','22.18' ];


  /**
   * generate the ticks for airspeed dial
   * @param {object} global usually 'document'
   * @param {string} ns namespace of svg
   * @param {object} parent element that ticks will be attached to
   * @memberof gg
   * @inner
   */
  function airspeedTicks(parent,dspeed) {
    "use strict";
    var r3 = 45.0;
    var r1 = 42.0;
    var r2 = 49.0;
    var cx = 50.0;
    var cy = 50.0;
    var a  = 270.0 * (Math.PI/180.0);
    var da = Math.PI / 22;
    var x1;
    var y1;
    var x2;
    var y2;
    var index;
    var line;
    var speed;
    var e;
    var g;

    g = _createElementSvg(standard_group_def.name,standard_group_def.attr);
    parent.appendChild(g);

    speed = dspeed;
    index = 2;
    for(var i=0;i<44;++i) {
      if ((i == 0)||(i==2)) {
        // skip
      }
      else if ((i % 4) == 0) {
        // bold tick with number
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1,y1,x2,y2,1.0);
        g.appendChild(e);
        e = global.createElementNS(ns,'text');
        e.setAttribute('x',txc2[index]);
        e.setAttribute('y',tyc2[index]);
        e.setAttribute('text-anchor','middle');
        e.innerHTML = speed.toFixed(0);
        g.appendChild(e);
        speed += dspeed;
        index++;
      }
      else if ((i % 2) == 0) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1,y1,x2,y2,1.0);
        g.appendChild(e);
      }
      else {
        // thin tick
        x1 = Math.cos(a) * r3 + cx;
        y1 = Math.sin(a) * r3 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1,y1,x2,y2,0.5);
        g.appendChild(e);
      }
      a += da;
    }
  }

  var vsi_y = [18,29,52,78,88,78,52.5,27];
  var vsi_x = [50,73,82,73,50,25,14,25];
  var vsi_t = ['10','15','20','15','10','5','0','5'];
  function vsiTicks(parent) {
    "use strict";
    var r3 = 45.0;
    var r1 = 40.0;
    var r2 = 49.0;
    var cx = 50.0;
    var cy = 50.0;
    var a  = 270.0 * (Math.PI/180.0);
    var da = Math.PI / 20;
    var x1;
    var y1;
    var x2;
    var y2;
    var line;
    var index;
    var e;
    var g;

    g = _createElementSvg(standard_group_def.name,standard_group_def.attr);
    parent.appendChild(g);

    index = 0;
    for(var i=0;i<40;++i) {
      if ((i == 9)||(i==11)) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1,y1,x2,y2,1.0);
        g.appendChild(e);
      }
      else if (i==10) {
        e = global.createElementNS(ns,'text');
        e.setAttribute('text-anchor','middle');
        e.setAttribute('x',vsi_x[index].toFixed(1));
        e.setAttribute('y',vsi_y[index].toFixed(1));
        e.innerHTML = vsi_t[index];
        g.appendChild(e);
        index++;
      }
      else if ((i % 5) == 0) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;

        e = drawLine(x1,y1,x2,y2,1.0);
        g.appendChild(e);

        e = global.createElementNS(ns,'text');
        e.setAttribute('text-anchor','middle');
        e.setAttribute('x',vsi_x[index].toFixed(1));
        e.setAttribute('y',vsi_y[index].toFixed(1));
        e.innerHTML = vsi_t[index];
        g.appendChild(e);
        index++;
      }
      else {
        x1 = Math.cos(a) * r3 + cx;
        y1 = Math.sin(a) * r3 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1,y1,x2,y2);
        g.appendChild(e);
      }
      a += da;
    }
  }

  function headingDial(parent,id)
  {
    "use strict";
    var r3 = 45.0;
    var r1 = 43.0;
    var r2 = 49.0;
    var r4 = 36.0;
    var cx = 0.0;
    var cy = 0.0;
    var a  = 270.0 * (Math.PI/180.0);
    var da = Math.PI / 36;
    var x1;
    var y1;
    var x2;
    var y2;
    var x4;
    var y4;
    var index;
    var d;
    var line;
    var e;
    var g;
    var t;

    //   <g id="gg145-heading-dial" stroke="#fff" fill="#fff" stroke-width="0.5" font-family="sans-serif" font-size="8" transform="translate(50 50) rotate(0)">
    g = _createElementSvg(standard_group_def.name,standard_group_def.attr,id + '-dial');
    g.setAttribute('transform','translate(50 50) rotate(0)');
    parent.appendChild(g);

    index = 0;
    d = 0;
    for(var i=0;i<72;++i) {
      if ((i % 6) == 0) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        x4 = Math.cos(a) * r4 + cx;
        y4 = Math.sin(a) * r4 + cy;

        // <line stroke-width='1.0' x1='-0.00' y1='-43.00' x2='-0.00' y2='-49.00' />
        e = drawLine(x1,y1,x2,y2,1.0);
        g.appendChild(e);

        // <text transform='translate(-0.00 -36.00) rotate(0)' >0</text>
        t  = "translate(";
        t += x4.toFixed(2) + " " + y4.toFixed(2);
        t += ") ";
        t += "rotate(";
        t += d.toFixed(0);
        t += ")";
        e = global.createElementNS(ns,'text');
        e.innerHTML = (d / 10).toFixed(0);
        e.setAttribute('transform',t);
        g.appendChild(e);

        d += 30.0;
      }
      else if ((i % 2) == 0) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1,y1,x2,y2,1.0);
        g.appendChild(e);
      }
      else {
        x1 = Math.cos(a) * r3 + cx;
        y1 = Math.sin(a) * r3 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1,y1,x2,y2);
        g.appendChild(e);
      }

      a += da;
    }
  }

  function vsiAnnotation(svg)
  {
    var g;
    var e;

    // <g fill='#fff' stroke='#fff' stroke-width='0.3' font-family='courier new' font-size='6'>
    g = _createElementSvg(vsi_group6_def.name,vsi_group6_def.attr);
    svg.appendChild(g);

    // <text text-anchor='middle' x='50' y='37' >VERTICAL</text>
    e = _createElementSvg(vsi_annotation_def.name,vsi_annotation_def.attr);
    e.setAttribute('x',50);
    e.setAttribute('y',37);
    e.innerHTML = 'VERTICAL';
    g.appendChild(e);

    // <text text-anchor='middle' x='50' y='43'>SPEED</text>
    e = _createElementSvg(vsi_annotation_def.name,vsi_annotation_def.attr);
    e.setAttribute('x',50);
    e.setAttribute('y',43);
    e.innerHTML = 'SPEED';
    g.appendChild(e);

    // <text text-anchor='left' x='14' y='43'>up</text>
    e = _createElementSvg(vsi_annotation_def.name,vsi_annotation_def.attr);
    e.setAttribute('x',14);
    e.setAttribute('y',43);
    e.innerHTML = 'up';
    g.appendChild(e);

    // <text text-anchor='left' x='14' y='61'>down</text>
    e = _createElementSvg(vsi_annotation_def.name,vsi_annotation_def.attr);
    e.setAttribute('x',14);
    e.setAttribute('y',61);
    e.innerHTML = 'down';
    g.appendChild(e);

    // <text text-anchor='middle' x='50' y='67'>100 ft</text>
    e = _createElementSvg(vsi_annotation_def.name,vsi_annotation_def.attr);
    e.setAttribute('x',50);
    e.setAttribute('y',67);
    e.innerHTML = '100 ft';
    g.appendChild(e);

    // <text text-anchor='middle' x='50' y='72'>per min</text>
    e = _createElementSvg(vsi_annotation_def.name,vsi_annotation_def.attr);
    e.setAttribute('x',50);
    e.setAttribute('y',72);
    e.innerHTML = 'per min';
    g.appendChild(e);
  }
  /**
   * create an arc for the airspeed indicator
   * with the given parameters
   * @param {number} start_speed speed at beginning of arc
   * @param {number} end_speed speed at end of arc
   * @param {number} range total range of airspeed dial
   * @param {number} radius of arc
   * @return {object} contains parameters for drawing the arc
   * @memberof gg
   * @inner
   */
  function arc(start_speed,end_speed,range,radius) {
    var a1 = ((start_speed * (Math.PI * 2)) / range) - (Math.PI / 2.0);
    var a2 = ((end_speed   * (Math.PI * 2)) / range) - (Math.PI / 2.0);
    var x1;
    var y1;
    var x2;
    var y2;
    var cx = 50.0;
    var cy = 50.0;
    x1 = cx + radius * Math.cos(a1);
    y1 = cy + radius * Math.sin(a1);
    x2 = cx + radius * Math.cos(a2);
    y2 = cy + radius * Math.sin(a2);


    return {
      radius : radius,
      x1 : x1,
      y1 : y1,
      x2 : x2,
      y2 : y2
    };
  }

  /**
   * create the path spec for an arc starting at a specified position
   * @param {object} arc parameters describing the arc (from function arc)
   * @return {string} 'd' spec for arc element
   * @memberof gg
   * @inner
   */
  function arc_path(arc)
  {
    var d = "M";
    d += arc.x2.toFixed(2) + " ";
    d += arc.y2.toFixed(2) + " ";
    d += "A ";
    d += arc.radius.toFixed(2) + " ";
    d += arc.radius.toFixed(2) + " ";
    d += "0 0 0 ";
    d += arc.x1.toFixed(2) + " ";
    d += arc.y1.toFixed(2);

    return d;
  }

  /**
   * create the arc specs for all arcs in an airspeed indicator
   * @param {number} range
   * @param {number} radius
   * @param {number} stall_flaps
   * @param {number} max_flaps
   * @param {number} stall_clean
   * @param {number} max_cruise
   * @param {number} min_caution
   * @param {number} max_caution
   * @param {number} never_exceed
   * @return {object} specs for all 4 arcs on the airspeed dial
   * @memberof gg
   * @inner
   */
  function makeLimitArcs(
      range,
      radius,
      stall_flaps,
      max_flaps,
      stall_clean,
      max_cruise,
      min_caution,
      max_caution,
      never_exceed
  )
  {
    var p;
    var green;
    var yellow;
    var red;
    var white;

    p = arc(stall_clean,max_cruise,range,radius);
    green = arc_path(p);

    p = arc(min_caution,max_caution,range,radius);
    yellow = arc_path(p);

    p = arc(never_exceed-1,never_exceed+1,range,radius);
    red = arc_path(p);

    p = arc(stall_flaps,max_flaps,range,radius-3);
    white = arc_path(p);

    return {
      green : green,
      yellow : yellow,
      red : red,
      white : white
    };
  }

  /**
  * generate the airspeed arc parameters
  * @param {object}  options         - for client side draw
  * @param {number}  options.range   - range index, 1 = 220
  * @param {array}   options.green   - [80,140]  green arc from clean stall to max cruise
  * @param {array}   options.yellow  - [140,160] yellow arc from max cruise to never-exceed
  * @param {array}   options.red     - [160,160] red arc from never-exceed to never-exceed
  * @param {array}   options.white   - [50,100]  white arc for stall-flaps to max-flaps
  * @memberof gg
  * @inner
  */
  function airspeedArcs(options) {
    var radius = 48;
    var range        = options.range;
    var stall_flaps  = options.white[0];
    var max_flaps    = options.white[1];
    var stall_clean  = options.green[0];
    var max_cruise   = options.green[1];
    var min_caution  = options.yellow[0];
    var max_caution  = options.yellow[1];
    var never_exceed = options.red;
    var arcs;
    var a;

    arcs = makeLimitArcs(options.range,
        radius,
        stall_flaps,
        max_flaps,
        stall_clean,
        max_cruise,
        min_caution,
        max_caution,
        never_exceed
    );

    return arcs;
  }


  /** airspeed path element
   * <path stroke-width="3" stroke="#0f0" d="M13.72 81.43 A 48.00 48.00 0 0 0 86.28 81.43"/>
   */
  var airspeed_arc_def = {
    name : 'path',
    attr : [
        ['stroke-width','3']
    ]
  };

  /**
   * draw an altimeter
   * @param global reference to global object (usually document)
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @memberof gg
   * @inner
   */
  function drawAltimeter(parent,id) {
    var ns = "http://www.w3.org/2000/svg";
    var e;
    var g;
    var svg;

    // svg element
    svg = _createElementSvg(svg_def.name,svg_def.attr,id);
    parent.appendChild(svg);

    // background rect
    e = _createElementSvg(background_def.name,background_def.attr);
    svg.appendChild(e);

    // dial circle
    e = _createElementSvg(dial_def.name,dial_def.attr);
    svg.appendChild(e);

    // drum text
    e = _createElementSvg(alt_drum_text_def.name,alt_drum_text_def.attr,id + '-drum');
    svg.appendChild(e);

    // pressure text
    e = _createElementSvg(alt_pressure_text_def.name,alt_pressure_text_def.attr,id + '-pwin');
    e.innerHTML = pad(29.92,5,2);
    svg.appendChild(e);

    // needle
    g = _createElementSvg(needle_group_def.name,needle_group_def.attr,id + '-needle');
    svg.appendChild(g);

    e = _createElementSvg(needle_path_def.name,needle_path_def.attr);
    g.appendChild(e);

    e = _createElementSvg(needle_tail_def.name,needle_tail_def.attr);
    g.appendChild(e);

    e = _createElementSvg(needle_center_def.name,needle_center_def.attr);
    g.appendChild(e);

    e = _createElementSvg(needle_tail2_def.name,needle_tail2_def.attr);
    g.appendChild(e);

    altimeterTicks(svg);
  }

  /**
   * draw an airspeed indicator
   * @param global reference to global object (usually document)
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @param {object}  options         - for client side draw
   * @param {number}  options.range   - range index, 1 = 220
   * @param {array}   options.green   - [80,140]  green arc from clean stall to max cruise
   * @param {array}   options.yellow  - [140,160] yellow arc from max cruise to never-exceed
   * @param {array}   options.red     - [160,160] red arc from never-exceed to never-exceed
   * @param {array}   options.white   - [50,100]  white arc for stall-flaps to max-flaps
   * @memberof gg
   * @inner
   */
  function drawAirspeed(parent,id,options)
  {
    var ns = "http://www.w3.org/2000/svg";
    var e;
    var g;
    var arcs;
    var svg;

    // get arc definitions
    arcs = airspeedArcs(options);

    // svg element
    svg = _createElementSvg(svg_def.name,svg_def.attr,id);
    parent.appendChild(svg);

    // background rect
    e = _createElementSvg(background_def.name,background_def.attr);
    svg.appendChild(e);

    // dial circle
    e = _createElementSvg(dial_def.name,dial_def.attr);
    svg.appendChild(e);

    // needle group
    g = _createElementSvg(needle_group_def.name,needle_group_def.attr,id + '-needle');
    svg.appendChild(g);

    e = _createElementSvg(needle_path_def.name,needle_path_def.attr);
    g.appendChild(e);

    e = _createElementSvg(airspeed_arc_def.name,airspeed_arc_def.attr);
    g.appendChild(e);

    e = _createElementSvg(needle_tail_def.name,needle_tail_def.attr);
    g.appendChild(e);

    e = _createElementSvg(needle_tail2_def.name,needle_tail2_def.attr);
    g.appendChild(e);
    // ===== end of needle

    // green,yellow and white are behind ticks
    e = _createElementSvg(airspeed_arc_def.name,airspeed_arc_def.attr);
    e.setAttribute('stroke','#0f0');
    e.setAttribute('d',arcs.green);
    svg.appendChild(e);

    // green,yellow and white are behind ticks
    e = _createElementSvg(airspeed_arc_def.name,airspeed_arc_def.attr);
    e.setAttribute('stroke','#ff0');
    e.setAttribute('d',arcs.yellow);
    svg.appendChild(e);

    // green,yellow and white are behind ticks
    e = _createElementSvg(airspeed_arc_def.name,airspeed_arc_def.attr);
    e.setAttribute('stroke','#fff');
    e.setAttribute('d',arcs.white);
    svg.appendChild(e);

    airspeedTicks(svg,20);

    // red is on top of ticks
    e = _createElementSvg(airspeed_arc_def.name,airspeed_arc_def.attr);
    e.setAttribute('stroke','#f00');
    e.setAttribute('d',arcs.red);
    svg.appendChild(e);
  }

  /**
   * draw a VSI
   * @param global reference to global object (usually document)
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @memberof gg
   * @inner
   */
  function drawVSI(parent,id) {
    var ns = "http://www.w3.org/2000/svg";
    var e;
    var g;
    var svg;

    // svg element
    svg = _createElementSvg(svg_def.name,svg_def.attr,id);
    parent.appendChild(svg);

    // background rect
    e = _createElementSvg(background_def.name,background_def.attr);
    svg.appendChild(e);

    // dial circle
    e = _createElementSvg(dial_def.name,dial_def.attr);
    svg.appendChild(e);

    // needle
    g = _createElementSvg(needle_group_def.name,needle_group_def.attr,id + '-needle');
    svg.appendChild(g);

    e = _createElementSvg(needle_path_def.name,needle_path_def.attr);
    g.appendChild(e);

    e = _createElementSvg(needle_tail_def.name,needle_tail_def.attr);
    g.appendChild(e);

    e = _createElementSvg(needle_center_def.name,needle_center_def.attr);
    g.appendChild(e);

    e = _createElementSvg(needle_tail2_def.name,needle_tail2_def.attr);
    g.appendChild(e);

    // text annotation
    vsiAnnotation(svg);

    // ticks
    vsiTicks(svg);
  }

  /**
   * draw a VSI
   * @param global reference to global object (usually document)
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @memberof gg
   * @inner
   */
  function drawHeading(parent,id) {
    var ns = "http://www.w3.org/2000/svg";
    var e;
    var g;
    var svg;

    var hdg_l1_def = {
      name: 'line',
      attr: [
          ['stroke','#fff'],
          ['stroke-width','0.5'],
          ['x1','50'],
          ['y1','5'],
          ['x2','50'],
          ['y2','20']
      ]
    };
    //<path stroke='#fff' stroke-width='0.5' d="M30,58 L30,50 L46,34 L46,26 L50,16.4 L54,26 L54,34 L70,50 L70,58 L54,50 L54,66 L62,70 L62,76.4 L50,71.6 L38,76.4 L38,70 L46,66 L46,50 L30,58"/>
    var hdg_ac_def = {
      name: 'path',
      attr: [
        ['stroke','#fff'],
        ['stroke-width','0.5'],
        ['d','M30,58 L30,50 L46,34 L46,26 L50,16.4 L54,26 L54,34 L70,50 L70,58 L54,50 L54,66 L62,70 L62,76.4 L50,71.6 L38,76.4 L38,70 L46,66 L46,50 L30,58']
      ]
    };

    // svg element
    svg = _createElementSvg(svg_def.name,svg_def.attr,id);
    parent.appendChild(svg);

    // background rect
    e = _createElementSvg(background_def.name,background_def.attr);
    svg.appendChild(e);

    // dial circle
    e = _createElementSvg(dial_def.name,dial_def.attr);
    svg.appendChild(e);

    e = _createElementSvg(hdg_l1_def.name,hdg_l1_def.attr);
    svg.appendChild(e);

    e = _createElementSvg(hdg_ac_def.name,hdg_ac_def.attr);
    svg.appendChild(e);

    // draw the dial
    headingDial(svg,id);
  }

  /**
   * Altimeter
   * @param global reference to global object (usually document)
   * @param parent reference to parent element, such as a div
   * @param altimeterId id to attach or reference to existing svg
   * @param draw true = draw the altimeter, false = assume static draw
   * @return {object} reference to altimeter object
   * @memberof gg
   * @global
   */
  function Altimeter(parent,id,draw) {
    var altimeter;
    var needle;
    var drum;
    var pwindow;

    if (draw) {
      drawAltimeter( parent, id);
    }
    altimeter = global.querySelector('#' + id);
    needle    = global.querySelector('#' + id + '-needle');
    drum      = global.querySelector('#' + id + '-drum');
    pwindow   = global.querySelector('#' + id + '-pwin');
    return {
      set : function(altitude) {
        if (altitude >= 999999) {
          altitude = 999999;
        }
        var d = (altitude % 1000) * (360.0 / 1000.0) - 90;
        drum.innerHTML = pad(altitude,6,0);
        needle.setAttribute('transform','translate(50,50),rotate(' + d + ')');
      },
      setPressure : function(pressure) {
        pwindow.innerHtml = pad(pressure,5,2);
      },
      resize : function(size) {
        var s = size.toString() + 'px';
        altimeter.setAttribute('width' ,s);
        altimeter.setAttribute('height',s);
      }
    };
  }

  /**
  * Airspeed Indicator
   * @param global global object, usually 'document'
   * @param parent parent element, such as a div
   * @param id element id of airspeed object
   * @param draw true to draw on client, false to use static svg with same id
   * @param {object}  options         - for client side draw
   * @param {number}  options.range   - range index, 1 = 220
   * @param {array}   options.green   - [80,140]  green arc from clean stall to max cruise
   * @param {array}   options.yellow  - [140,160] yellow arc from max cruise to never-exceed
   * @param {array}   options.red     - [160,160] red arc from never-exceed to never-exceed
   * @param {array}   options.white   - [50,100]  white arc for stall-flaps to max-flaps
   * @return {object} reference to an airspeed object
   * @memberof gg
   * @global
   */
  function Airspeed(parent,id,draw,options) {
    var airspeed;
    var needle  ;

    if (draw) {
      drawAirspeed( parent, id,options);
    }
    airspeed = global.querySelector('#' + id);
    needle   = global.querySelector('#' + id + '-needle');

    return {
      set : function(knots) {
        if (knots >= 230) {
          knots = 230;
        }
        var d = knots * (360.0 / 230.0)-90.0;
        needle.setAttribute('transform','translate(50,50),rotate(' + d + ')');
      },
      resize : function(size) {
        var s = size.toString() + 'px';
        airspeed.setAttribute('width' ,s);
        airspeed.setAttribute('height',s);
      }
    };
  }

  /**
   * heading Indicator
   * @param global global object, usually 'document'
   * @param parent parent element, such as a div
   * @param id element id of airspeed object
   * @param draw true to draw on client, false to use static svg with same id
   * @return {object} reference to a heading indicator
   * @memberof gg
   * @global
   */
  function Heading(parent,id,draw) {

    if (draw) {
      drawHeading( parent, id);
    }

    var heading = global.querySelector('#' + id);
    var dial    = global.querySelector('#' + id + '-dial');

    return {
      set : function(degrees) {
        degrees *= -1;
        dial.setAttribute('transform','translate(50 50) rotate(' + degrees.toFixed(0) + ')');
      },
      resize : function(size) {
        var s = size.toString() + 'px';
        heading.setAttribute('width' ,s);
        heading.setAttribute('height',s);
      }
    };
  }

  /**
   * Attitude Indicator
   * @param global global object, usually 'document'
   * @param parent parent element, such as a div
   * @param id element id of airspeed object
   * @param draw true to draw on client, false to use static svg with same id
   * @return {object} reference to an attitude indicator
   * @memberof gg
   * @global
   */
  function Attitude(parent,id,draw) {
    var attitude = global.querySelector('#' + id);

    return {
      set : function(pitch,roll) {
      },
      resize : function(size) {
        var s = size.toString() + 'px';
        attitude.setAttribute('width' ,s);
        attitude.setAttribute('height',s);
      }
    };
  }

  /**
   * Turn and Bank Indicator
   * @param global global object, usually 'document'
   * @param parent parent element, such as a div
   * @param id element id of airspeed object
   * @param draw true to draw on client, false to use static svg with same id
   * @return {object} reference to a turn and bank object
   * @memberof gg
   * @global
   */
  function Turn(parent,id,draw) {
    var turn  = global.querySelector('#' + id);
    var plane = global.querySelector('#' + id + '-plane');
    var ball  = global.querySelector('#' + id + '-ball');
    return {
      set : function(rate,accel) {
        var x;
        var y;
        var r  = 119.0;
        var cx =  50;
        var cy = -50;
        // plane
        plane.setAttribute('transform','translate(50,50) rotate(' + (rate*5.3).toFixed(0) + ')');
        // ball
        accel += 90.0;
        x = Math.cos(accel * (Math.PI / 180.0)) * r + cx;
        y = Math.sin(accel * (Math.PI / 180.0)) * r + cy;
        ball.setAttribute('cx',x);
        ball.setAttribute('cy',y);
      },
      resize : function(size) {
        var s = size.toString() + 'px';
        turn.setAttribute('width' ,s);
        turn.setAttribute('height',s);
      }
    };
  }

  /**
   * Vertical Speed Indicator
   * @param global global object, usually 'document'
   * @param parent parent element, such as a div
   * @param id element id of airspeed object
   * @param draw true to draw on client, false to use static svg with same id
   * @return {object} reference to a VSI
   * @memberof gg
   * @global
   */
  function VSI(parent,id,draw) {
    if (draw) {
      drawVSI( parent, id);
    }

    var vsi    = global.querySelector('#' + id);
    var needle = global.querySelector('#' + id + '-needle');

    return {
      set : function(vertical_speed) {
        if (vertical_speed >= 2000) {
          vertical_speed = 2000;
        }
        else if (vertical_speed <= -2000) {
          vertical_speed = -2000;
        }
        var d = vertical_speed * (360.0 / 4000)-180.0;
        needle.setAttribute('transform','translate(50,50),rotate(' + d + ')');
      },
      resize : function(size) {
        var s = size.toString() + 'px';
        vsi.setAttribute('width' ,s);
        vsi.setAttribute('height',s);
      }
    };
  }

  /**
   *
   */
  return {
    Altimeter:Altimeter,
    Airspeed:Airspeed,
    Heading:Heading,
    Attitude:Attitude,
    Turn:Turn,
    VSI:VSI
  };

}(document));
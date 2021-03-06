var map;
var DroitLatLng=new Object();
var CentreLatLng=new Object();
var GaucheLatLng=new Object();
$('body').on('change','.eqLogicAttr[data-l1key=configuration][data-l2key=isRandom]',function(){
	if($(this).is(':checked'))
		$('.Presence').show();
	else
		$('.Presence').hide();
});
$('body').on('change','.eqLogicAttr[data-l1key=configuration][data-l2key=heliotrope]',function(){
	$.ajax({
		type: 'POST',            
		async: false,
		url: 'plugins/Volets/core/ajax/Volets.ajax.php',
		data:{
			action: 'getInformation',
			heliotrope:$(this).val(),
		},
		dataType: 'json',
		global: false,
		error: function(request, status, error) {},
		success: function(data) {
			if (!data.result)
				$('#div_alert').showAlert({message: 'Aucun message reçu', level: 'error'});
			if (typeof(data.result.geoloc) !== 'undefined') {
				var center=data.result.geoloc.configuration.coordinate.split(",");
				//CentreLatLng=data.result.geoloc.configuration.coordinate.split(",");
				CentreLatLng.lat=parseFloat(center[0]);
				CentreLatLng.lng=parseFloat(center[1]);
				// création de la carte
				$('#MyMap').show();
				/*map = new ol.Map({
					target: 'MyMap',
					layers: [
						new ol.layer.Tile({
							source: new ol.source.OSM()
						})
					],
					view: new ol.View({
						center: CentreLatLng,
						zoom: 5
					})
				});*/
				map = new google.maps.Map( document.getElementById('MyMap'),{
					'mapTypeControl':  true,
					'streetViewControl': false,
					'panControl':true,
					'scaleControl': true,
					'overviewMapControl': true,
					'mapTypeId': google.maps.MapTypeId.ROADMAP,
					'center': CentreLatLng,
					'scrollwheel': true,
					'zoom': 20
				});
			}
		}
	});
});
function getAngle(Coordinates) {
		var longDelta = Coordinates[1].lng - Coordinates[0].lng;
		var y = Math.sin(longDelta) * Math.cos(Coordinates[1].lat);
		var x = Math.cos(Coordinates[0].lat)*Math.sin(Coordinates[1].lat) - Math.sin(Coordinates[0].lat)*Math.cos(Coordinates[1].lat)*Math.cos(longDelta);

		var radians = Math.atan2(y, x);
		var angle = radians * 180 / Math.PI
		while (angle < 0) {
			angle += 360;
		}
		angle=angle % 360;
		angle=angle-90;
		return  angle;
	}

function saveEqLogic(_eqLogic) {
	_eqLogic.configuration.condition=new Object();
	_eqLogic.configuration.action=new Object();
	var ConditionArray= new Array();
	var OpenArray= new Array();
	var CloseArray= new Array();
	$('#tab_condition .ConditionGroup').each(function( index ) {
		ConditionArray.push($(this).getValues('.expressionAttr')[0])
	});
	$('#tab_ouverture .ActionGroup').each(function( index ) {
		OpenArray.push($(this).getValues('.expressionAttr')[0])
	});
	$('#tab_fermeture .ActionGroup').each(function( index ) {
		CloseArray.push($(this).getValues('.expressionAttr')[0])
	});
	_eqLogic.configuration.condition=ConditionArray;
	_eqLogic.configuration.action.open=OpenArray;
	_eqLogic.configuration.action.close=CloseArray;
   	return _eqLogic;
}
function printEqLogic(_eqLogic) {
	$('.ConditionGroup').remove();
	$('.ActionGroup').remove();
	$('.eqLogicAttr[data-l1key=configuration][data-l2key=Droite]').val(JSON.stringify(_eqLogic.configuration.Droite));
	$('.eqLogicAttr[data-l1key=configuration][data-l2key=Centre]').val(JSON.stringify(_eqLogic.configuration.Centre));
	$('.eqLogicAttr[data-l1key=configuration][data-l2key=Gauche]').val(JSON.stringify(_eqLogic.configuration.Gauche));
	TraceMapZone(_eqLogic);
	if (typeof(_eqLogic.configuration.condition) !== 'undefined') {
		for(var index in _eqLogic.configuration.condition) { 
			if( (typeof _eqLogic.configuration.condition[index] === "object") && (_eqLogic.configuration.condition[index] !== null) )
				addCondition(_eqLogic.configuration.condition[index],  '{{Condition}}',$('#tab_condition').find('.div_Condition'));
		}
	}
	if (typeof(_eqLogic.configuration.action) !== 'undefined') {
		if (typeof(_eqLogic.configuration.action.open) !== 'undefined') {
			for(var index in _eqLogic.configuration.action.open) { 
				if( (typeof _eqLogic.configuration.action.open[index] === "object") && (_eqLogic.configuration.action.open[index] !== null) )
					addAction(_eqLogic.configuration.action.open[index],  '{{Action}}',$('#tab_ouverture').find('.div_action'));
			}
		}
		if (typeof(_eqLogic.configuration.action.close) !== 'undefined') {
			for(var index in _eqLogic.configuration.action.close) { 
				if( (typeof _eqLogic.configuration.action.close[index] === "object") && (_eqLogic.configuration.action.close[index] !== null) )
					addAction(_eqLogic.configuration.action.close[index],  '{{Action}}',$('#tab_fermeture').find('.div_action'));
			}
		}
	}	
}
function TraceMapZone(_zone){
	/*DroitLatLng[0]=CentreLatLng[0];
	DroitLatLng[1]=CentreLatLng[1]- (1 / 3600);
	GaucheLatLng[0]=CentreLatLng[0];
	GaucheLatLng[1]=CentreLatLng[1]+ (1 / 3600);*/
	
	DroitLatLng.lat=CentreLatLng.lat;
	DroitLatLng.lng=CentreLatLng.lng- (1 / 3600);
	GaucheLatLng.lat=CentreLatLng.lat;
	GaucheLatLng.lng=CentreLatLng.lng+ (1 / 3600);
	if (typeof(_zone.configuration.Droite) !== 'undefined' && _zone.configuration.Droite != "") {
		if (typeof(_zone.configuration.Droite.lat) !== 'undefined' && _zone.configuration.Droite.lat != "" ) 
			DroitLatLng.lat=parseFloat(_zone.configuration.Droite.lat);
		if (typeof(_zone.configuration.Droite.lng) !== 'undefined' && _zone.configuration.Droite.lng != "" ) 
			DroitLatLng.lng=parseFloat(_zone.configuration.Droite.lng);
	}
	if (typeof(_zone.configuration.Gauche) !== 'undefined' && _zone.configuration.Gauche != "") {
		if (typeof(_zone.configuration.Gauche.lat) !== 'undefined' && _zone.configuration.Gauche.lat != "" ) 
			GaucheLatLng.lat=parseFloat(_zone.configuration.Gauche.lat);
		if (typeof(_zone.configuration.Gauche.lng) !== 'undefined' && _zone.configuration.Gauche.lng != "" ) 
			GaucheLatLng.lng=parseFloat(_zone.configuration.Gauche.lng);
	}
	if (typeof(_zone.configuration.Centre) !== 'undefined' && _zone.configuration.Centre != "") {
		if (typeof(_zone.configuration.Centre.lat) !== 'undefined' && _zone.configuration.Centre.lat != "" ) 
			CentreLatLng.lat=parseFloat(_zone.configuration.Centre.lat);
		if (typeof(_zone.configuration.Centre.lng) !== 'undefined' && _zone.configuration.Centre.lng != "" )
			CentreLatLng.lng=parseFloat(_zone.configuration.Centre.lng);
	}
	/*var Droit = new ol.Feature({
		type: 'geoMarker',
		geometry: new ol.geom.Point(DroitLatLng)
	});
	var Centre = new ol.Feature({
		type: 'geoMarker',
		geometry: new ol.geom.Point(CentreLatLng)
	});
	var Gauche = new ol.Feature({
		type: 'geoMarker',
		geometry: new ol.geom.Point(GaucheLatLng)
	});
	var styles = {
		'route': new ol.style.Style({
			stroke: new ol.style.Stroke({
				width: 6, color: [237, 212, 0, 0.8]
			})
		}),
		'geoMarker': new ol.style.Style({
			image: new ol.style.Circle({
				radius: 7,
				snapToPixel: false,
				fill: new ol.style.Fill({color: 'black'}),
				stroke: new ol.style.Stroke({
					color: 'white', width: 2
				})
			})
		})
	};
	var vectorLayer = new ol.layer.Vector({
		source: new ol.source.Vector({
		  features: [Droit, Centre, Gauche]
		}),
		style: function(feature) {
			// hide geoMarker if animation is active
			if (animating && feature.get('type') === 'geoMarker') {
				return null;
			}
			return styles[feature.get('type')];
		}
	});
	map.addLayer(vectorLayer);
	/*var moveFeature = function(event) {
		var vectorContext = event.vectorContext;
		var frameState = event.frameState;
		vectorContext.drawFeature(feature, styles.geoMarker);
		$('.eqLogicAttr[data-l1key=configuration][data-l2key=Droite]').val(JSON.stringify(event.latLng));
		map.render();
	};
	map.on('postcompose', moveFeature);*/
	var Droit=new google.maps.Marker({
		position: DroitLatLng,
		map: map,
		draggable:true,
		title: _zone.name + " - Droite vue extérieur"
	  });
	var Centre=new google.maps.Marker({
		position: CentreLatLng,
		map: map,
		draggable:true,
		title: _zone.name + " - Centre de l'angle d'ouverture"
	  });
	var Gauche=new google.maps.Marker({
		position: GaucheLatLng,
		map: map,
		draggable:true,
		title: _zone.name  + " - Gauche vue extérieur"
	  });
	var PolylineDroite =new google.maps.Polyline({
		path: [CentreLatLng,DroitLatLng],
		geodesic: true,
		strokeColor: '#40A497',
		strokeOpacity: 1.0,
		map: map,
		strokeWeight: 2
	});
	var PolylineGauche =new google.maps.Polyline({
		path: [GaucheLatLng,CentreLatLng],
		geodesic: true,
		strokeColor: '#40A497',
		strokeOpacity: 1.0,
		map: map,
		strokeWeight: 2
	});
	google.maps.event.addListener(Droit,'drag', function(event) {
		DroitLatLng.lat=event.latLng.lat();
		DroitLatLng.lng=event.latLng.lng();
		$('.eqLogicAttr[data-l1key=configuration][data-l2key=Droite]').val(JSON.stringify(event.latLng));
		PolylineDroite.setPath([CentreLatLng,DroitLatLng]);
	});
	google.maps.event.addListener(Centre,'drag', function(event) {
		CentreLatLng.lat=event.latLng.lat();
		CentreLatLng.lng=event.latLng.lng();
		$('.eqLogicAttr[data-l1key=configuration][data-l2key=Centre]').val(JSON.stringify(event.latLng));
		PolylineGauche.setPath([GaucheLatLng,CentreLatLng]);
		PolylineDroite.setPath([CentreLatLng,DroitLatLng]);
	});
	google.maps.event.addListener(Gauche,'drag', function(event) {
		GaucheLatLng.lat=event.latLng.lat();
		GaucheLatLng.lng=event.latLng.lng();
		$('.eqLogicAttr[data-l1key=configuration][data-l2key=Gauche]').val(JSON.stringify(event.latLng));
		PolylineGauche.setPath([CentreLatLng,GaucheLatLng]);
		});
}
function addCondition(_action, _name, _el) {
    	var div = $('<div class="form-group ConditionGroup">')
  		.append($('<label class="col-lg-1 control-label">')
			.text('ET'))
   		.append($('<div class="col-lg-2">')
			.append($('<div class="input-group">')
				.append($('<input class="expressionAttr form-control input-sm cmdCondition" data-l1key="expression">'))
				.append($('<span class="input-group-btn">')
					.append($('<a class="btn btn-warning btn-sm listCmdCondition">')
						.append($('<i class="fa fa-list-alt">'))))))
		.append($('<div class="col-lg-2">')
			.append($('<select class="expressionAttr form-control input-sm cmdCondition" data-l1key="TypeGestion" />')
			       .append($('<option value="all">')
					.text('{{Position du soleil et Jour / Nuit}}'))
			       .append($('<option value="Helioptrope">')
					.text('{{Position du soleil}}'))
			       .append($('<option value="DayNight">')
					.text('{{Jour / Nuit}}'))))			
		.append($('<div class="col-lg-2">')
			.append($('<select class="expressionAttr form-control input-sm cmdCondition" data-l1key="evaluation" />')
			       .append($('<option value="all">')
					.text('{{Toutes les saisons}}'))
			       .append($('<option value="close">')
					.text('{{Eté}}'))
			       .append($('<option value="open">')
					.text('{{Hivers}}'))))
 		.append($('<div class="col-lg-2">')
  			.append($('<i class="fa fa-minus-circle pull-left cursor conditionAttr" data-action="remove">')));
        _el.append(div);
        _el.find('.ConditionGroup:last').setValues(_action, '.expressionAttr');
  
}
function addAction(_action, _name, _el) {
	var div = $('<div class="form-group ActionGroup">')
		.append($('<label class="col-sm-1 control-label">')
			.text(_name))
		.append($('<div class="col-sm-4 has-success">')
			.append($('<div class="input-group">')
				.append($('<span class="input-group-btn">')
					.append($('<input type="checkbox" class="expressionAttr" data-l1key="enable"/>'))
					.append($('<a class="btn btn-default bt_removeAction btn-sm" data-type="inAction">')
						.append($('<i class="fa fa-minus-circle">'))))
				.append($('<input class="expressionAttr form-control input-sm cmdAction" data-l1key="cmd" data-type="inAction"/>'))
				.append($('<span class="input-group-btn">')
					.append($('<a class="btn btn-success btn-sm listAction" data-type="inAction" title="Sélectionner un mot-clé">')
						.append($('<i class="fa fa-tasks">')))
					.append($('<a class="btn btn-success btn-sm listCmdAction" data-type="inAction">')
						.append($('<i class="fa fa-list-alt">'))))))
		.append($('<div class="col-sm-7 actionOptions">')
		       .append($(jeedom.cmd.displayActionOption(init(_action.cmd, ''), _action.options))))
 		.append($('<div class="col-sm-8">')
  			.append($('<i class="fa fa-minus-circle pull-left cursor ActionAttr" data-action="remove">')));
        _el.append(div);
        _el.find('.ActionGroup:last').setValues(_action, '.expressionAttr');
  
}
$('#tab_zones a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
});
$('body').on('focusout','.expressionAttr[data-l1key=cmd]', function (event) {
    var expression = $(this).closest('.ActionGroup').getValues('.expressionAttr');
    var el = $(this);
    jeedom.cmd.displayActionOption($(this).value(), init(expression[0].options), function (html) {
        el.closest('.ActionGroup').find('.actionOptions').html(html);
    })
});
$('body').on('click','.conditionAttr[data-action=add]',function(){
	addCondition({},  '{{Condition}}',$(this).closest('.form-horizontal').find('.div_Condition'));
});
$('body').on('click','.conditionAttr[data-action=remove]',function(){
	$(this).closest('.ConditionGroup').remove();
});
$('body').on('click','.listCmdCondition',function(){
	var el = $(this).closest('.form-group').find('.expressionAttr[data-l1key=expression]');	
	jeedom.cmd.getSelectModal({cmd: {type: 'info'}}, function (result) {
		var message = 'Aucun choix possible';
		if(result.cmd.subType == 'numeric'){
			message = '<div class="row">  ' +
			'<div class="col-md-12"> ' +
			'<form class="form-horizontal" onsubmit="return false;"> ' +
			'<div class="form-group"> ' +
			'<label class="col-xs-5 control-label" >'+result.human+' {{est}}</label>' +
			'             <div class="col-xs-3">' +
			'                <select class="conditionAttr form-control" data-l1key="operator">' +
			'                    <option value="==">{{égal}}</option>' +
			'                  <option value=">">{{supérieur}}</option>' +
			'                  <option value="<">{{inférieur}}</option>' +
			'                 <option value="!=">{{différent}}</option>' +
			'            </select>' +
			'       </div>' +
			'      <div class="col-xs-4">' +
			'         <input type="number" class="conditionAttr form-control" data-l1key="operande" />' +
			'    </div>' +
			'</div>' +
			'<div class="form-group"> ' +
			'<label class="col-xs-5 control-label" >{{Ensuite}}</label>' +
			'             <div class="col-xs-3">' +
			'                <select class="conditionAttr form-control" data-l1key="next">' +
			'                    <option value="">rien</option>' +
			'                  <option value="OU">{{ou}}</option>' +
			'            </select>' +
			'       </div>' +
			'</div>' +
			'</div> </div>' +
			'</form> </div>  </div>';
		}
		if(result.cmd.subType == 'string'){
			message = '<div class="row">  ' +
			'<div class="col-md-12"> ' +
			'<form class="form-horizontal" onsubmit="return false;"> ' +
			'<div class="form-group"> ' +
			'<label class="col-xs-5 control-label" >'+result.human+' {{est}}</label>' +
			'             <div class="col-xs-3">' +
			'                <select class="conditionAttr form-control" data-l1key="operator">' +
			'                    <option value="==">{{égale}}</option>' +
			'                  <option value="matches">{{contient}}</option>' +
			'                 <option value="!=">{{différent}}</option>' +
			'            </select>' +
			'       </div>' +
			'      <div class="col-xs-4">' +
			'         <input class="conditionAttr form-control" data-l1key="operande" />' +
			'    </div>' +
			'</div>' +
			'<div class="form-group"> ' +
			'<label class="col-xs-5 control-label" >{{Ensuite}}</label>' +
			'             <div class="col-xs-3">' +
			'                <select class="conditionAttr form-control" data-l1key="next">' +
			'                    <option value="">{{rien}}</option>' +
			'                  <option value="OU">{{ou}}</option>' +
			'            </select>' +
			'       </div>' +
			'</div>' +
			'</div> </div>' +
			'</form> </div>  </div>';
		}
		if(result.cmd.subType == 'binary'){
			message = '<div class="row">  ' +
			'<div class="col-md-12"> ' +
			'<form class="form-horizontal" onsubmit="return false;"> ' +
			'<div class="form-group"> ' +
			'<label class="col-xs-5 control-label" >'+result.human+' {{est}}</label>' +
			'            <div class="col-xs-7">' +
			'                 <input class="conditionAttr" data-l1key="operator" value="==" style="display : none;" />' +
			'                  <select class="conditionAttr form-control" data-l1key="operande">' +
			'                       <option value="1">{{Ouvert}}</option>' +
			'                       <option value="0">{{Fermé}}</option>' +
			'                       <option value="1">{{Allumé}}</option>' +
			'                       <option value="0">{{Éteint}}</option>' +
			'                       <option value="1">{{Déclenché}}</option>' +
			'                       <option value="0">{{Au repos}}</option>' +
			'                       </select>' +
			'                    </div>' +
			'                 </div>' +
			'<div class="form-group"> ' +
			'<label class="col-xs-5 control-label" >{{Ensuite}}</label>' +
			'             <div class="col-xs-3">' +
			'                <select class="conditionAttr form-control" data-l1key="next">' +
			'                  <option value="">{{rien}}</option>' +
			'                  <option value="OU">{{ou}}</option>' +
			'            </select>' +
			'       </div>' +
			'</div>' +
			'</div> </div>' +
			'</form> </div>  </div>';
		}

		bootbox.dialog({
			title: "{{Ajout d'une nouvelle condition}}",
			message: message,
			buttons: {
				"Ne rien mettre": {
					className: "btn-default",
					callback: function () {
						el.atCaret('insert', result.human);
					}
				},
				success: {
					label: "Valider",
					className: "btn-primary",
					callback: function () {
    						var condition = result.human;
						condition += ' ' + $('.conditionAttr[data-l1key=operator]').value();
						if(result.cmd.subType == 'string'){
							if($('.conditionAttr[data-l1key=operator]').value() == 'matches'){
								condition += ' "/' + $('.conditionAttr[data-l1key=operande]').value()+'/"';
							}else{
								condition += ' "' + $('.conditionAttr[data-l1key=operande]').value()+'"';
							}
						}else{
							condition += ' ' + $('.conditionAttr[data-l1key=operande]').value();
						}
						condition += ' ' + $('.conditionAttr[data-l1key=next]').value()+' ';
						el.atCaret('insert', condition);
						if($('.conditionAttr[data-l1key=next]').value() != ''){
							el.click();
						}
					}
				},
			}
		});
	});
});
$('body').on('click','.ActionAttr[data-action=add]',function(){
	addAction({},  '{{Action}}',$(this).closest('.form-horizontal').find('.div_action'));
});
$('body').on('click','.ActionAttr[data-action=remove]', function () {
	$(this).closest('.ActionGroup').remove();
});
$("body").on('click', ".listAction", function() {
	var el = $(this).closest('.form-group').find('.expressionAttr[data-l1key=cmd]');
	jeedom.getSelectActionModal({}, function (result) {
		el.value(result.human);
		jeedom.cmd.displayActionOption(el.value(), '', function (html) {
			el.closest('.form-group').find('.actionOptions').html(html);
		});
	});
}); 
$("body").on('click', ".listCmdAction", function() {
	var el = $(this).closest('.form-group').find('.expressionAttr[data-l1key=cmd]');
	jeedom.cmd.getSelectModal({cmd: {type: 'action'}}, function (result) {
		el.value(result.human);
		jeedom.cmd.displayActionOption(el.value(), '', function (html) {
			el.closest('.form-group').find('.actionOptions').html(html);
		});
	});
});
function addCmdToTable(_cmd) {
	var tr =$('<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">');
	tr.append($('<td>')
		.append($('<input type="hidden" class="cmdAttr form-control input-sm" data-l1key="id">'))
		.append($('<input class="cmdAttr form-control input-sm" data-l1key="name" value="' + init(_cmd.name) + '" placeholder="{{Name}}" title="Name">')));
	var parmetre=$('<td>');	
	parmetre.append($('<span class="type" type="' + init(_cmd.type) + '">')
			.append(jeedom.cmd.availableType()));
	parmetre.append($('<span class="subType" subType="'+init(_cmd.subType)+'">'));
	if (is_numeric(_cmd.id)) {
		parmetre.append($('<a class="btn btn-default btn-xs cmdAction" data-action="test">')
			.append($('<i class="fa fa-rss">')
				.text('{{Tester}}')));
	}
	parmetre.append($('<a class="btn btn-default btn-xs cmdAction tooltips" data-action="configure">')
		.append($('<i class="fa fa-cogs">')));
	parmetre.append($('<div>')
		.append($('<span>')
			.append($('<label class="checkbox-inline">')
				.append($('<input type="checkbox" class="cmdAttr checkbox-inline" data-size="mini" data-label-text="{{Historiser}}" data-l1key="isHistorized" checked/>'))
				.append('{{Historiser}}')
				.append($('<sup>')
					.append($('<i class="fa fa-question-circle tooltips" style="font-size : 1em;color:grey;">')
					.attr('title','Souhaitez vous Historiser les changements de valeur'))))));
	parmetre.append($('<div>')
		.append($('<span>')
			.append($('<label class="checkbox-inline">')
				.append($('<input type="checkbox" class="cmdAttr checkbox-inline" data-size="mini" data-label-text="{{Afficher}}" data-l1key="isVisible" checked/>'))
				.append('{{Afficher}}')
				.append($('<sup>')
					.append($('<i class="fa fa-question-circle tooltips" style="font-size : 1em;color:grey;">')
					.attr('title','Souhaitez vous afficher cette commande sur le dashboard'))))));
	tr.append(parmetre);
	$('#table_cmd tbody').append(tr);
	$('#table_cmd tbody tr:last').setValues(_cmd, '.cmdAttr');
	jeedom.cmd.changeType($('#table_cmd tbody tr:last'), init(_cmd.subType));
}

function ChangeWind(wind){  // принимает значение с плавающей точкой от -10 до 10
	wind = Math.round(wind);
	if( wind == 0 ){  // нет ветра -- очищаем полоску
		var current_block;
		for(var i = 0; i < 10; ++i){
			current_block = $("#arrow0" + i).attr('class');
			$('#arrow0' + i).removeClass(current_block);
			$('#arrow0' + i).addClass('empty_space_for_arrow');		

			current_block = $("#arrow1" + i).attr('class');
			$('#arrow1' + i).removeClass(current_block);
			$('#arrow1' + i).addClass('empty_space_for_arrow');	
		}
	}
	else if ( wind > 0 ){
		for(var i = 0; i < 10; ++i){
			current_block = $("#arrow0" + i).attr('class');
			$('#arrow0' + i).removeClass(current_block);
			$('#arrow0' + i).addClass('empty_space_for_arrow');		
		}
		for(var i = 0; i < wind; ++i){
			current_block = $("#arrow1" + i).attr('class');
			$('#arrow1' + i).removeClass(current_block);
			$('#arrow1' + i).addClass('right_arrow');		
		}
		for(var i = wind; i < 10; ++i){
			current_block = $("#arrow1" + i).attr('class');
			$('#arrow1' + i).removeClass(current_block);
			$('#arrow1' + i).addClass('empty_space_for_arrow');		
		}
	}
	else if ( wind < 0 ){
		wind = -wind;
		for(var i = 0; i < (10-wind); ++i){
			current_block = $("#arrow0" + i).attr('class');
			$('#arrow0' + i).removeClass(current_block);
			$('#arrow0' + i).addClass('empty_space_for_arrow');		
		}
		for(var i = 10-wind; i < 10; ++i){
			current_block = $("#arrow0" + i).attr('class');
			$('#arrow0' + i).removeClass(current_block);
			$('#arrow0' + i).addClass('left_arrow');		
		}
		for(var i = 0; i < 10; ++i){
			current_block = $("#arrow1" + i).attr('class');
			$('#arrow1' + i).removeClass(current_block);
			$('#arrow1' + i).addClass('empty_space_for_arrow');		
		}
	}
}
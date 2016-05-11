var album_name;
var album_date;
var album_location;
var photos = [];
var photos_info = [];
var cover_id;
var cover_url;
var tags = [];
var counter = 0;
var loaded = 0;
var current = 0;

function getAlbumInfo(photoset_id) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photosets.getInfo&api_key=b5915b4e4a36d456caa767bdb9003cbc&photoset_id='+photoset_id+'&user_id=129588168%40N02&format=json&nojsoncallback=1');
	request.setRequestHeader('Accept','application/json');

	request.onreadystatechange = function () {
	  if (this.readyState === 4) {
	    var data = jQuery.parseJSON(this.responseText);
	    album_name = data.photoset.title._content;
	    album_date = data.photoset.description._content.split('@')[0].trim();
	    album_location = data.photoset.description._content.split('@')[1];
	    $('#album-title').text(album_name);
	    $('#album-date').text(album_date);
	    $('#album-location').text(album_location);
	    console.log("album_name="+album_name);
	    console.log("album_date="+album_date);
	    console.log("album_location="+album_location);
	    // console.log(data);
	  }
	};
	request.send();
};

function getAlbumPhotos(photoset_id) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=b5915b4e4a36d456caa767bdb9003cbc&photoset_id='+photoset_id+'&user_id=129588168%40N02&page=1&format=json&nojsoncallback=1');
	request.setRequestHeader('Accept','application/json');

	request.onreadystatechange = function () {
	  if (this.readyState === 4) {
	    var data = jQuery.parseJSON(this.responseText);
	    cover_id = data.photoset.primary;
	    var pages = data.photoset.pages;
	    photos = photos.concat(data.photoset.photo);
	    // console.log(photos);
	    if(pages > 1) {
		    for(var i = 2; i <= pages; i++) {
		    	var request = new XMLHttpRequest();
				request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=b5915b4e4a36d456caa767bdb9003cbc&photoset_id='+photoset_id+'&user_id=129588168%40N02&page='+i+'&format=json&nojsoncallback=1');
				request.setRequestHeader('Accept','application/json');

				request.onreadystatechange = function () {
				  if (this.readyState === 4) {
				    var data = jQuery.parseJSON(this.responseText);
				    photos = photos.concat(data.photoset.photo);
				    if(i-1 == pages) {
				    	//album done
				    	for(var j = 0; j < photos.length; j++){
				    		if(photos[j].id == cover_id) {
				    			cover_url = "https://farm"+photos[j].farm+".staticflickr.com/"+photos[j].server+"/"+photos[j].id+"_"+photos[j].secret+"_h.jpg";
				    			console.log(cover_url);
				    			$('.album-banner-black').css('background-image','url('+cover_url+')');
				    		}
				    		getPhotoInfo(photos[j].id, photos[j].secret, j);
				    	}
				    }
				  }
				};
				request.send();
		    }
		} else {
			for(var j = 0; j < photos.length; j++){
	    		if(photos[j].id == cover_id) {
	    			cover_url = "https://farm"+photos[j].farm+".staticflickr.com/"+photos[j].server+"/"+photos[j].id+"_"+photos[j].secret+"_h.jpg";
	    			console.log(cover_url);
	    			$('.album-banner-black').css('background-image','url('+cover_url+')');
	    		}
	    		getPhotoInfo(photos[j].id, photos[j].secret, j);
	    	}
		}
	  }
	};
	request.send();
};

function getPhotoInfo(photo_id, photo_secret, k) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=b5915b4e4a36d456caa767bdb9003cbc&photo_id='+photo_id+'&secret='+photo_secret+'&format=json&nojsoncallback=1');
	request.setRequestHeader('Accept','application/json');

	request.onreadystatechange = function () {
	  if (this.readyState === 4) {
	    var data = jQuery.parseJSON(this.responseText);
	    photos_info[k] = {
	    	"photo_title":data.photo.title._content,
			"photo_url":"https://farm"+data.photo.farm+".staticflickr.com/"+data.photo.server+"/"+data.photo.id+"_"+data.photo.secret+"_z.jpg",
			"photo_date":data.photo.dates.taken.split(" ")[0],
			"photo_time":data.photo.dates.taken.split(" ")[1],
			"photo_tags":data.photo.tags.tag,
			"photo_owner":data.photo.owner.realname,
			"owner_url":"https://www.flickr.com/photos/"+data.photo.owner.path_alias
	    };
	    for(var i = 0; i < data.photo.tags.tag.length; i++) {
	    	tags.push(data.photo.tags.tag[i]._content);
	    }
	    loaded++;

	    if(loaded == photos.length) {
	    	//photos done
	    	console.log(photos_info);
	    	tags = unique(tags);
	    	console.log(tags);

	    	//Load Tags
	    	for(var i = 0; i < tags.length; i++) {
	    		$('.button-group').append('<button class="button" data-filter=".'+tags[i]+'">'+tags[i]+'</button>');
	    	}
	    	$('.button-group').children().css('opacity',0);
	    	appendPhotos(50);
	    	current = 50;
	    }
	  }
	};
	request.send();
}

function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}

//Angkor Trip - 72157667507455746
//Seoul Trip - 72157663650469790
//Finland Trip - 72157661256330416
//New York Trip - 72157651866953659
//Tokyo Trip - 72157649613805629
var album_id = "72157667507455746";

$(document).ready(function(){
	getAlbumInfo(album_id);
	getAlbumPhotos(album_id);

	$('#close').click(function(){
		$('.button-group').children().css('opacity',0);
	    $('.button-group').slideToggle(450, function(){
	    	$('#filtering span').css('display','block');
	    	setTimeout(function(){
	    		$('#filtering span').css('opacity','1');
	    	}, 10);
	    });
	});
	$('#filtering span').click(function(){
	    $('.button-group').slideToggle(450, function(){
	    	$('#filtering span').css('opacity',0);
	    	setTimeout(function(){
	    		$('#filtering span').css('display','none');
	    	}, 250);
	    });
	    setTimeout(function(){
	    	$('.button-group').children().css('opacity',1);
	    }, 250);
	});

	$('.button-group').each( function( i, buttonGroup ) {
	  var $buttonGroup = $( buttonGroup );
	  $buttonGroup.on( 'click', 'button', function() {
	    if($(this).hasClass('is-checked')) $(this).removeClass('is-checked');
	    else $(this).addClass('is-checked');
	    
	    var filtervalue = "";
	    $('.is-checked').each(function(i){ 
	      filtervalue += $(this).attr('data-filter');
	      
	    });
	    console.log(filtervalue);
	    $('.grid').isotope({ filter: filtervalue });
	  });
	});
})


//Events
$( window ).resize(function() {
    $('.grid').css('margin-left', ($(window).width()-$('.grid').width())/2);
});

var flag = false;

$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
   	if(!flag) {
	   flag = true;
       appendPhotos(current+50);
	   current+=50;
	}
   }
});

$('.grid').on( 'layoutComplete', function( event, filteredItems ) {
    $('.grid').css('margin-left', ($(window).width()-$('.grid').width())/2);
});

//Append Photos
function appendPhotos(number){
	console.log(current+"-"+number);
	var max = number;
	if(max > photos.length) max = photos.length;
	for(var i = current; i < max; i++) {
		var phototags = "";
		for(var j = 0; j < photos_info[i].photo_tags.length; j++) {
	    	phototags += photos_info[i].photo_tags[j]._content;
	    	phototags += " ";
	    }
	    var $items = $('<div class="photo '+phototags+'" style="background-image: url('+photos_info[i].photo_url+')"></div>');
		if(number > 50) $('.grid').append($items).isotope('appended', $items);
		else $('.grid').append($items);
    }
    	
    $('.photo').each(function(i){
    	if(i < current) ;
    	else {
	        var $this = $(this);
	        var img = new Image;
	        img.src = $this.css('background-image').replace(/url\(\"|\"\)$/ig, "");
	        $(img).one('load', function(){
	            var bgImgWidth = img.width;
	            var bgImgHeight = img.height;
	            var newHeight = $this.width()*bgImgHeight/bgImgWidth;
	            $this.css('height',newHeight);
	            // console.log("!");
	            $('.grid').isotope({
	              itemSelector: '.photo',
	              masonry: {
	                // columnWidth: 212,
	                isFitWidth: true
	              },
	              hiddenStyle: {
				    opacity: 0
				  },
				  visibleStyle: {
				    opacity: 1
				  }
	            });
	            $('.grid').css('margin-left', ($(window).width()-$('.grid').width())/2);
	        });
	    }
	    flag = false;
    });
}
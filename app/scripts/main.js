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

var initial = 20;
var increment = 30;
var current_photo;
var mode = -1;
var init = false;

var albums = [];
var covers = [];
var cover_loaded = 0;

function getAlbums() {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=b5915b4e4a36d456caa767bdb9003cbc&user_id=129588168%40N02&format=json&nojsoncallback=1');
	request.setRequestHeader('Accept','application/json');

	request.onreadystatechange = function () {
	  if (this.readyState === 4) {
	    var data = jQuery.parseJSON(this.responseText);
	    console.log(data);
	    for(var i = 0; i < data.photosets.total; i++) {
	    	getCoverPhoto(data.photosets.photoset[i].primary, i, data.photosets.total, data);
	    }
	  }
	};
	request.send();
};

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
				    			var img = new Image;
						        img.src = $('.album-banner-black').css('background-image').replace(/url\(\"|\"\)$/ig, "");
						        $(img).one('load', function(){
				    				$('.album-banner, #filtering').css('opacity',1);
				    			});
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
	    			var img = new Image;
			        img.src = $('.album-banner-black').css('background-image').replace(/url\(\"|\"\)$/ig, "");
			        $(img).one('load', function(){
	    				$('.album-banner, #filtering').css('opacity',1);
	    			});
	    		}
	    		getPhotoInfo(photos[j].id, photos[j].secret, j);
	    	}
		}
	  }
	};
	request.send();
};

function getCoverPhoto(photo_id, k, total, data) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=b5915b4e4a36d456caa767bdb9003cbc&photo_id='+photo_id+'&format=json&nojsoncallback=1');
	request.setRequestHeader('Accept','application/json');

	request.onreadystatechange = function () {
		if (this.readyState === 4) {
		  var data1 = jQuery.parseJSON(this.responseText);
		  covers[k] = "https://farm"+data1.photo.farm+".staticflickr.com/"+data1.photo.server+"/"+data1.photo.id+"_"+data1.photo.secret+"_h.jpg";
			albums[k] = {
				country_name:data.photosets.photoset[k].title._content.split('Trip')[0],
				album_cover:covers[k],
				photo_numbers:data.photosets.photoset[k].photos,
				album_id: data.photosets.photoset[k].id
			}
			cover_loaded++;
			if(cover_loaded == total) {
				console.log(albums);
				for( var j = 0; j < total; j++) {
					$('.albums').append('<a href="#'+albums[j].country_name+'"><div class="col-md-4 col-xs-12"><div class="album" data-id="'+albums[j].album_id+'" style="background-image: url('+ albums[j].album_cover +')"><h2 class="album-country">'+ albums[j].country_name +'</h2></div></div>');
					if(j+1 == total) {
						$('.album').last().css('padding-bottom', '70px');
						$('.album').click(function(){
							console.log("?!?!?!");
							setTimeout(function(){
								$('.album-list').css('opacity', 0);
							},10);
							var $this = $(this);
							setTimeout(function(){
								mode = 0;
								console.log($this.attr('data-id'));
								getAlbumInfo($this.attr('data-id'));
								getAlbumPhotos($this.attr('data-id'));
								$('.album-list').css('display', 'none');
							},260);
						});
					}
				}
			}
		}
	};
	request.send();
}

function getPhotoInfo(photo_id, photo_secret, k) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=b5915b4e4a36d456caa767bdb9003cbc&photo_id='+photo_id+'&secret='+photo_secret+'&format=json&nojsoncallback=1');
	request.setRequestHeader('Accept','application/json');

	request.onreadystatechange = function () {
	  if (this.readyState === 4) {
	    var data = jQuery.parseJSON(this.responseText);
	    photos_info[k] = {
	    	"photo_size":"",
	    	"photo_title":data.photo.title._content,
			"photo_url":"https://farm"+data.photo.farm+".staticflickr.com/"+data.photo.server+"/"+data.photo.id+"_"+data.photo.secret+"_h.jpg",
			"photo_date":data.photo.dates.taken.split(" ")[0],
			"photo_time":data.photo.dates.taken.split(" ")[1],
			"photo_tags":data.photo.tags.tag,
			"photo_owner":data.photo.owner.realname,
			"owner_url":"https://www.flickr.com/photos/"+data.photo.owner.path_alias
	    };
	    getPhotoSize(photo_id, photo_secret, k);
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
	    	appendPhotos(initial);
	    	current = initial;
	    }
	  }
	};
	request.send();
}

function getPhotoSize(photo_id, photo_secret, k) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=b5915b4e4a36d456caa767bdb9003cbc&photo_id='+photo_id+'&secret='+photo_secret+'&format=json&nojsoncallback=1');
	request.setRequestHeader('Accept','application/json');

	request.onreadystatechange = function () {
	  if (this.readyState === 4) {
	    var data = jQuery.parseJSON(this.responseText);
	    if(parseInt(data.sizes.size[2].width) > parseInt(data.sizes.size[2].height)) {
	    	photos_info[k].photo_size = true;
	    }
	    else {
	    	photos_info[k].photo_size = false;
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
	getAlbums();
	// getAlbumInfo(album_id);
	// getAlbumPhotos(album_id);

	$('#close').click(function(){
		$('.button-group').children().css('opacity',0);
	    $('.button-group').slideToggle(450, function(){
	    	$('#filtering span').css('display','inline');
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

	// window.setInterval(function(){
	//   if(!flag && current+increment <= photos.length && init) {
	// 	   flag = true;
	//        appendPhotos(current+increment);
	// 	   current+=increment;
	// 	}
	// }, 5000);
})


//Events

$(window).resize(function() {
    $('.grid').css('margin-left', ($(window).width()-$('.grid').width())/2);
});

window.onhashchange = function() {
 //blah blah blah
 var url = window.location.href;
 console.log(url);
 if (url.match("#") == null) {

 	$('.album-list').css('display', 'block');
 	setTimeout(function(){
 		$('.album-list').css('opacity', 1);
 	}, 10);
	 setTimeout(function(){
	 	resetAlbum();
	 },260);
 }
}

var flag = false;

$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
   	if(!flag) {
	   flag = true;
       appendPhotos(current+increment);
	   current+=increment;
	}

   }
});



$('.grid').on( 'layoutComplete', function( event, filteredItems ) {
    $('.grid').css('margin-left', ($(window).width()-$('.grid').width())/2);
});

function resetAlbum(){
	photos = [];
	photos_info = [];
	tags = [];
	counter = 0;
	loaded = 0;
	current = 0;
	initial = 20;
	increment = 30;
	mode = -1;
	if($('.grid').children().length != 0) $('.grid').isotope('destroy');
	$('.grid').empty();
	$('.album-banner h1, .album-banner span').empty();
	$('.album-banner, #filtering').css('opacity',0);
	$('.album-banner-black').css('background-image', '');
	$('.button-group').empty();
}

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
	    var url = photos_info[i].photo_url;
	    var size = "";
	    if(photos_info[i].photo_size) size="landscape ";
	    else size="portrait ";

	    var $items = $('<div class="photo '+size+phototags+'"><img src="'+url+'"/></div>');
		if(number > initial) {
			$('.grid').append($items).isotope('appended', $items);
		}
		else $('.grid').append('<div class="photo hiding '+size+phototags+'"><img src="'+url+'"/></div>');
    }
    var checking = 0;
    $('.photo').each(function(i){
    	checking++;
    	if(i < current) ;
    	else {
	        var $this = $(this);
	        var img = new Image;
	        img.src = $this.find('img').attr('src').replace(/url\(\"|\"\)$/ig, "");
	        $(img).one('load', function(){
	            if(number > initial) {
	            	$this.find('img').css('opacity',1);
	            }
	        });
	        var thumb = new Image;
	        thumb.src = $this.find('img').attr('src').replace(/url\(\"|\"\)$/ig, "").replace('_h.jpg', '_t.jpg');
	        $this.css('background-image', "url("+thumb.src+")");
	        $(thumb).one('load', function(){
	        	var bgImgWidth = img.width;
	            var bgImgHeight = img.height;
	            var newHeight = $this.width()*bgImgHeight/bgImgWidth;
	            $this.css('height',newHeight);
	        });

	        if(checking == $('.photo').length){
		        console.log("done!!");
	        	
	        	if(number > initial) {
		            var $grid = $('.grid').isotope({
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
		            $grid.imagesLoaded().progress( function() {
					  $grid.isotope('layout');
					});
		        }
		        else {
		        	var $grid = $('.grid').imagesLoaded( function() {
		        	  $('.photo img').css('opacity', 1);
					  // init Isotope after all images have loaded
					  $grid.isotope({
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
					  setTimeout(function(){
					  	$('.hiding').removeClass('hiding');
					  }, 250);
					});
		        }
			    PhotosDone();
			    init = true;
	        }
	    }
	    flag = false;
    });
}

function PhotosDone(){
	$('.photo').click(function(){
		current_photo = $(this);
		var src = $(this).find('img').attr('src');
		$('.lightbox').find('img').attr('src', src);
		$('.lightbox .backdrop').css('background-image', 'url('+src+')');
		// $('body').css('overflow-y', 'hidden');
		$('.lightbox').imagesLoaded(function(){
			$('.lightbox').css('opacity',1);
			$('.lightbox').css('z-index',10);
			$('.lightbox img').css('opacity',1);
		});
		mode = 1;
	});
	$('.lightbox').click(function(){
		$('.lightbox').css('opacity',0);
		// $('body').css('overflow-y', 'scroll');
		setTimeout(function(){
			$('.lightbox').find('img').attr('src', '');		
			$('.lightbox').css('z-index',-1);
			$('.lightbox img').css('opacity',0);
		},250);
		mode = 0;
	});
	$(document).keydown(function(e) {
		if(mode == 1) {
		    switch(e.which) {
		        case 37: // left
		        console.log(current_photo.prev());
		        if(current_photo.prev().length != 0) {
			        var src = current_photo.prev().find('img').attr('src');
			        current_photo = current_photo.prev();
			        $('.lightbox').find('img').css('opacity', 0);
			        $('.lightbox .backdrop').css('opacity', 0);
			        $('.lightbox .backdrop').css('background-image', 'url('+src+')');
			        setTimeout(function(){
			        	$('.lightbox').find('img').attr('src', src);
			        	$('.lightbox').find('img').css('opacity', 1);
			        	$('.lightbox .backdrop').css('opacity', .3);
			        },250);
			    }
		        break;

		        case 38: // up
		        break;

		        case 39: // right
		        console.log(current_photo.next());
		        if(current_photo.next().length != 0) {
			        var src = current_photo.next().find('img').attr('src');
			        current_photo = current_photo.next();
			        $('.lightbox').find('img').css('opacity', 0);
			        $('.lightbox .backdrop').css('opacity', 0);
					$('.lightbox .backdrop').css('background-image', 'url('+src+')');
					setTimeout(function(){
			        	$('.lightbox').find('img').attr('src', src);
			        	$('.lightbox').find('img').css('opacity', 1);
			        	$('.lightbox .backdrop').css('opacity', .3);
			        },250);
				}
		        break;

		        case 40: // down
		        break;

		        default: return; // exit this handler for other keys
		    }
		    e.preventDefault(); // prevent the default action (scroll / move caret)
		}
	});
}
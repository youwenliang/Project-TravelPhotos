var album_name;
var album_date;
var album_location;
var photos = [];
var photos_info = [];
var cover_id;
var cover_url;

function getAlbumInfo(photoset_id) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photosets.getInfo&api_key=7727dfc8d38ca43ff2d91ddc3d1e37f7&photoset_id='+photoset_id+'&user_id=129588168%40N02&format=json&nojsoncallback=1');
	request.setRequestHeader('Accept','application/json');

	request.onreadystatechange = function () {
	  if (this.readyState === 4) {
	    var data = jQuery.parseJSON(this.responseText);
	    album_name = data.photoset.title._content;
	    album_date = data.photoset.description._content.split('@')[0].trim();
	    album_location = data.photoset.description._content.split('@')[1];
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
			    			console.log("cover_url="+cover_url);
			    		}
			    		getPhotoInfo(photos[j].id, photos[j].secret, j);
			    	}
			    }
			  }
			};
			request.send();
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
			"photo_url":"https://farm"+data.photo.farm+".staticflickr.com/"+data.photo.server+"/"+data.photo.id+"_"+data.photo.secret+"_h.jpg",
			"photo_date":data.photo.dates.taken.split(" ")[0],
			"photo_time":data.photo.dates.taken.split(" ")[1],
			"photo_tags":data.photo.tags.tag,
			"photo_owner":data.photo.owner.realname,
			"owner_url":"https://www.flickr.com/photos/"+data.photo.owner.path_alias
	    }
	    if(k + 1 == photos.length) {
	    	//photos done
	    	console.log(photos_info);
	    }
	  }
	};
	request.send();
}

//Angkor Trip - 72157667507455746
//Seoul Trip - 72157663650469790
//Finland Trip - 72157661256330416
//New York Trip - 72157651866953659
//Tokyo Trip - 72157649613805629

getAlbumInfo("72157667507455746");
getAlbumPhotos("72157667507455746");
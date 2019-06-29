

//Module used to return a given movingBox's position
exports.switchBool = function(bool,movingBoxLocation,movingBoxLocation2){

		if(bool == 1){
		    return movingBoxLocation;
		}
		else if(bool == -1){
			return movingBoxLocation2;
		}
}

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProduitSchema = new Schema({
   name: {
    type: String,
    required: true
  },
  category : {
    type: String,
    required: false
  }, 
  description: {
    type: String,
    required: true
  },
 lieu: {
    type: Array,
    required: true
  },
  price: {
    type: Number,
    required: false
  },
  devise: {
    type: String,
    required: false
  },
  status :{ 
    type: String,
    required: false,
  },
  imageurl :{
    type : String,
    required :false,
  },
   userid:{type: Schema.Types.ObjectId, ref: 'users'}
});
module.exports = mongoose.model('produits', ProduitSchema);
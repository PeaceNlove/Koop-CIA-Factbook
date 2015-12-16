// Defines the routes and params name that will be passed in req.params 
// routes tell Koop what controller method should handle what request route

module.exports = {
  // route : handler
  'post /factbook': 'register',
  'get /factbook': 'index',
  'get /factbook/:id/:dataset/' : 'getData',
  'get /factbook/:id/:dataset/FeatureServer': 'featureserver',
  'get /factbook/:id/:dataset/FeatureServer/:layer': 'featureserver',
  'get /factbook/:id/:dataset/FeatureServer/:layer/:method': 'featureserver',
  
}


const uuid   = global.require('uuid');

module.exports = function(App)
{
	App.uuid = function()
	{
		return uuid.v4();
	}
}
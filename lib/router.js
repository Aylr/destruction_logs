Router.configure({
    layoutTemplate: 'layoutTemplate'
});

Router.route('/', {name: 'homeTemplate'});
Router.route('/log', {name: 'logTemplate'});
Router.route('/batches', {name: 'batchListTemplate'});
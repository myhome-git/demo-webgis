





function SceneCtrl(target) {

    var container = new UI.Panel();
	container.setId( 'sidebar' );	//
    container.setStyle("bottom",[window.innerHeight/4+'px']);
	var sceneTab = new UI.Text('scene').setTextTransform( 'uppercase' );
	sceneTab.onClick( function () { select( 'SCENE' ) } );

	var projectTab = new UI.Text('project' ).setTextTransform( 'uppercase' );
	projectTab.onClick( function () { select( 'PROJECT' ) } );

	var settingsTab = new UI.Text( 'settings' ).setTextTransform( 'uppercase' );
	settingsTab.onClick( function () { select( 'SETTINGS' ) } );

	var tabs = new UI.Div();
	tabs.setId( 'tabs' );
	tabs.add( sceneTab, projectTab, settingsTab );
	container.add( tabs );

	//

    document.body.appendChild( container.dom );

    

    var scene = new UI.Span().add(
		new Sidebar.Scene( editor ),
		new Sidebar.Properties( editor ),
		new Sidebar.Animation( editor ),
		new Sidebar.Script( editor )
	);
	container.add( scene );

	var project = new UI.Span().add(
		new Sidebar.Project( editor )
	);
	container.add( project );

	var settings = new UI.Span().add(
		new Sidebar.Settings( editor ),
		new Sidebar.History( editor )
	);
	container.add( settings );

    function select( section ) {

        sceneTab.setClass( '' );
        projectTab.setClass( '' );
        settingsTab.setClass( '' );
    
        scene.setDisplay( 'none' );
        project.setDisplay( 'none' );
        settings.setDisplay( 'none' );
    
        switch ( section ) {
            case 'SCENE':
                sceneTab.setClass( 'selected' );
                scene.setDisplay( '' );
                break;
            case 'PROJECT':
                projectTab.setClass( 'selected' );
                project.setDisplay( '' );
                break;
            case 'SETTINGS':
                settingsTab.setClass( 'selected' );
                settings.setDisplay( '' );
                break;
        }
    
    }
    
    select( 'SCENE' );

}
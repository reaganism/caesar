use caesar_util::paths::{DiscordFlavor, DiscordPath, DiscordPathResolver};
use gtk::gdk::DisplayManager;
use gtk::{
    glib, Align, Application, Box, CssProvider, Label, Orientation, ScrolledWindow, Settings,
};
use gtk::{prelude::*, ApplicationWindow};

const APP_ID: &str = "dev.tomat.caesar-installer";

fn main() -> glib::ExitCode {
    let app = Application::builder().application_id(APP_ID).build();

    app.connect_startup(|_| prefer_dark_mode());
    app.connect_startup(|_| load_css());
    app.connect_activate(build_ui);

    app.run()
}

fn prefer_dark_mode() {
    Settings::set_gtk_application_prefer_dark_theme(
        &Settings::default().expect("Could not resolve settings."),
        true,
    );
}

fn load_css() {
    let provider = CssProvider::new();
    provider.load_from_data(include_str!("styles/global.css"));

    gtk::style_context_add_provider_for_display(
        &DisplayManager::get()
            .default_display()
            .expect("Could not connect to a display."),
        &provider,
        gtk::STYLE_PROVIDER_PRIORITY_APPLICATION,
    )
}

fn build_ui(app: &Application) {
    let main_box = Box::builder()
        .orientation(Orientation::Vertical)
        .css_classes(vec!["main-box"])
        .spacing(20)
        .build();

    let title_label = Label::builder()
        .label("caesar Installer")
        .css_classes(vec!["title-label"])
        .build();
    main_box.append(&title_label);

    let description_label = Label::builder()
        .label("This is the installer for caesar, a reimplementation of the Discord desktop bootstrapper, focusing on performance and stability.")
        .build();
    main_box.append(&description_label);

    let selection_area = build_selection_area_ui();
    selection_area.set_halign(Align::Fill);
    main_box.append(&selection_area);

    let window = ApplicationWindow::builder()
        .application(app)
        .title("caesar Installer")
        .default_width(800)
        .default_height(600)
        .resizable(false)
        .child(&main_box)
        .build();

    window.present();
}

fn build_selection_area_ui() -> Box {
    let area = Box::builder().orientation(Orientation::Vertical).build();

    let scrollable_window = ScrolledWindow::builder()
        .hscrollbar_policy(gtk::PolicyType::Automatic)
        .vscrollbar_policy(gtk::PolicyType::Never)
        .child(&build_scrollable_area_ui())
        .build();

    scrollable_window.set_halign(Align::Fill);
    area.append(&scrollable_window);

    area
}

fn build_scrollable_area_ui() -> Box {
    let flavors = vec![
        DiscordFlavor::Stable,
        DiscordFlavor::Ptb,
        DiscordFlavor::Canary,
        DiscordFlavor::Dev,
    ];

    let paths = flavors
        .into_iter()
        .map(|flavor| flavor.resolve_discord_paths())
        .flatten()
        .collect::<Vec<_>>();

    let installable_boxes = paths
        .into_iter()
        .map(|path| build_installation_ui(path))
        .collect::<Vec<_>>();

    let scrollable_area = Box::builder()
        .orientation(Orientation::Vertical)
        .spacing(20)
        .build();

    for installable_box in installable_boxes {
        scrollable_area.append(&installable_box);
    }

    scrollable_area
}

fn build_installation_ui(path: DiscordPath) -> Box {
    let button_box = Box::builder()
        .orientation(Orientation::Horizontal)
        .spacing(10)
        .css_classes(vec!["button-box"])
        .build();

    let install_button = gtk::Button::builder()
        .label("Install")
        .css_classes(vec!["install-button"])
        .build();
    install_button.set_halign(Align::End);
    button_box.append(&install_button);

    let uninstall_button = gtk::Button::builder()
        .label("Uninstall")
        .css_classes(vec!["uninstall-button"])
        .build();
    uninstall_button.set_halign(Align::End);
    button_box.append(&uninstall_button);

    let installable_box = Box::builder()
        .orientation(Orientation::Vertical)
        .css_classes(vec!["installable-box"])
        .build();

    let title_label = Label::builder()
        .label(path.directory_path.file_name().unwrap().to_str().unwrap())
        .css_classes(vec!["title-label"])
        .build();

    let description_label = Label::builder()
        .label(path.directory_path.to_str().unwrap())
        .build();

    installable_box.append(&title_label);
    installable_box.append(&description_label);
    installable_box.append(&button_box);

    installable_box
}

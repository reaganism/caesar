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
        .label("Caesar Installer")
        .css_classes(vec!["title-label"])
        .build();
    main_box.append(&title_label);

    let description_label = Label::builder()
        .label("This is the installer for Caesar, a reimplementation of the Discord desktop bootstrapper focusing on performance and stability.")
        .build();
    main_box.append(&description_label);

    let selection_area = build_selection_area_ui();
    selection_area.set_halign(Align::Fill);
    main_box.append(&selection_area);

    let window = ApplicationWindow::builder()
        .application(app)
        .title("Caesar Installer")
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
        .hscrollbar_policy(gtk::PolicyType::Never)
        .vscrollbar_policy(gtk::PolicyType::Automatic)
        .child(&build_scrollable_area_ui())
        .height_request(460)
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
        .spacing(2)
        .build();

    for installable_box in installable_boxes {
        scrollable_area.append(&installable_box);
    }

    scrollable_area
}

fn build_installation_ui(path: DiscordPath) -> Box {
    let button_box = Box::builder()
        .orientation(Orientation::Horizontal)
        .spacing(4)
        .css_classes(vec!["button-box"])
        .build();

    let install_button = gtk::Button::builder()
        .label("Install")
        .css_classes(vec!["install-button"])
        .build();
    // install_button.set_halign(Align::End);
    button_box.append(&install_button);

    let uninstall_button = gtk::Button::builder()
        .label("Uninstall")
        .css_classes(vec!["uninstall-button"])
        // .width_request(100)
        .build();
    // uninstall_button.set_halign(Align::End);
    button_box.append(&uninstall_button);

    let installable_box = Box::builder()
        .orientation(Orientation::Horizontal)
        .css_classes(vec!["installable-box"])
        .width_request(-1)
        .build();

    let name = match path.flavor {
        DiscordFlavor::Stable => "Stable Install",
        DiscordFlavor::Ptb => "PTB Install",
        DiscordFlavor::Canary => "Canary Install",
        DiscordFlavor::Dev => "Development Install",
    };

    let label_box = Box::builder()
        .orientation(Orientation::Vertical)
        .css_classes(vec!["label-box"])
        .width_request(600)
        .build();

    let title_label = Label::builder()
        .label(name)
        .css_classes(vec!["install-title-label"])
        .build();

    let description_label = Label::builder()
        .label(path.directory_path.to_str().unwrap())
        .css_classes(vec!["install-description-label"])
        .build();

    label_box.append(&title_label);
    label_box.append(&description_label);
    label_box.set_halign(Align::Fill);
    button_box.set_halign(Align::End);
    installable_box.append(&label_box);
    installable_box.append(&button_box);

    installable_box
}

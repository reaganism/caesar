use gtk::gdk::DisplayManager;
use gtk::{glib, Application, CssProvider, Settings};
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
    let window = ApplicationWindow::builder()
        .application(app)
        .title("caesar Installer")
        .build();
    window.present();
}

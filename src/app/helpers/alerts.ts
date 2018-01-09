export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface AlertSettings {
    overlay?: boolean;
    overlayClickToClose?: boolean;
    showCloseButton?: boolean;
    duration?: number;
}

export interface AlertEmit {
    close?: boolean;
    message?: any;
    title?: any;
    type?: AlertType;
    override?: AlertSettings;
}
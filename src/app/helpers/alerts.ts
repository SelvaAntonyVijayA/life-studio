export type AlertType = 'success' | 'warning' | 'error' | 'info' | 'confirm';

export interface ResolveEmit {
    resolved?: boolean;
    closedWithOutResolving?: string;
}

export interface AlertSettings {
    overlay?: boolean;
    overlayClickToClose?: boolean;
    showCloseButton?: boolean;
    duration?: number;
    confirmText?: string; // Default: 'Yes'
    declineText?: string; // Default: 'No'
}

export interface AlertEmit {
    close?: boolean;
    message?: any;
    title?: any;
    type?: AlertType;
    resolve?: any;
    override?: AlertSettings;
}
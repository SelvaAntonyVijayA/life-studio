export type AlertType = 'success' | 'warning' | 'error' | 'info' | 'confirm' | 'question' | 'prompt';

export interface ResolveEmit {
    resolved?: any;
    closedWithOutResolving?: string;
}

export interface AlertSettings {
    overlay?: boolean;
    overlayClickToClose?: boolean;
    showCloseButton?: boolean;
    messageIsTemplate?: boolean;
    titleIsTemplate?: boolean,
    duration?: number;
    confirmText?: string; // Default: 'Yes'
    declineText?: string; // Default: 'No'
    btnText1?: string;
    btnText2?: string;
    btnText3?: string;
    btnText4?: string;
}

export interface AlertEmit {
    close?: boolean;
    message?: any;
    title?: any;
    type?: AlertType;
    resolve?: any;
    override?: AlertSettings;
}
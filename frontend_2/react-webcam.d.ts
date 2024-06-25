declare module 'react-webcam' {
    import * as React from 'react';

    interface WebcamProps {
        audio?: boolean;
        height?: number | string;
        width?: number | string;
        screenshotFormat?: string;
        onUserMedia?: () => void;
        ref?: React.RefObject<Webcam>;
    }

    class Webcam extends React.Component<WebcamProps> {
        getScreenshot(): string | null;
    }

    export default Webcam;
}

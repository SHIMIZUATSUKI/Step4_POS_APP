"use client";

import React, { useState, useEffect } from 'react';
import Quagga from 'quagga';

interface ProductScanProps {
    onScan: (barcode: string) => void;
}

const ProductScan: React.FC<ProductScanProps> = ({ onScan }) => {
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (scanning) {
            Quagga.init({
                inputStream: {
                    type: "LiveStream",
                    target: document.querySelector('#scanner-container')
                },
                decoder: {
                    readers: ["ean_reader"]
                }
            }, function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
                Quagga.start();
            });

            Quagga.onDetected((data) => {
                const fullCode = data.codeResult.code;
                console.log("Full Scanned Code:", fullCode);

                const trimmedCode = fullCode.slice(0, -1).slice(-6);
                console.log("Trimmed Code:", trimmedCode);

                onScan(trimmedCode);
                setScanning(false);
                Quagga.stop();
            });
        }

        return () => {
            if (scanning) {
                Quagga.stop();
            }
        };
    }, [scanning]);

    const startScanning = () => setScanning(true);
    const stopScanning = () => {
        setScanning(false);
        Quagga.stop();
    };

    return (
        <div className="scan-container">
            <button
                onClick={startScanning}
                className={`button ${scanning ? 'hidden' : ''}`}
            >
                スキャン（カメラ）
            </button>
            {scanning && (
                <div className="scanner-wrapper">
                    <div id="scanner-container" className="scanner-container"></div>
                    <button onClick={stopScanning} className="button stop-button">
                        停止
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductScan;

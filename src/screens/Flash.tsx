import { useEffect, useState } from "react";
import { CheckCircle, Usb, WarningCircle } from "@phosphor-icons/react";
import { ESPLoader, Transport } from "esptool-js";
import { Card } from "../components/ui";
import "./Flash.css";

const FIRMWARE_PARTS = [
  { path: "/proink-companion/firmware/v0.2.0/bootloader.bin", address: 0x0 },
  { path: "/proink-companion/firmware/v0.2.0/partitions.bin", address: 0x8000 },
  { path: "/proink-companion/firmware/v0.2.0/boot_app0.bin", address: 0xe000 },
  { path: "/proink-companion/firmware/v0.2.0/firmware.bin", address: 0x10000 },
];

const ESPRESSIF_VENDOR_ID = 0x303a;
const USB_JTAG_PRODUCT_IDS = new Set([0x1001, 0x1002, 0x1003, 0x0002, 0x0003]);

type WebSerialNavigator = Navigator & {
  serial: {
    requestPort(options?: { filters?: Array<{ usbVendorId: number }> }): Promise<SerialPort>;
  };
};

function useWebSerialSupport() {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "serial" in navigator);
  }, []);

  return supported;
}

function errorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No device was selected. Choose the Proink USB Serial/JTAG device and try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The browser could not communicate with the device.";
}

async function downloadFirmware() {
  return Promise.all(
    FIRMWARE_PARTS.map(async (part) => {
      const response = await fetch(part.path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Could not download ${part.path.split("/").pop()} (${response.status}).`);
      }

      return {
        address: part.address,
        data: new Uint8Array(await response.arrayBuffer()),
      };
    }),
  );
}

export function Flash() {
  const supported = useWebSerialSupport();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [installing, setInstalling] = useState(false);

  const install = async () => {
    let transport: Transport | undefined;
    let loader: ESPLoader | undefined;

    setInstalling(true);
    setError(null);
    setProgress(0);

    try {
      setStatus("Choose your Proink device...");
      const port = await (navigator as WebSerialNavigator).serial.requestPort({
        filters: [{ usbVendorId: ESPRESSIF_VENDOR_ID }],
      });
      const portInfo = port.getInfo();

      if (
        portInfo.usbVendorId !== ESPRESSIF_VENDOR_ID ||
        !USB_JTAG_PRODUCT_IDS.has(portInfo.usbProductId ?? -1)
      ) {
        throw new Error("Choose the Proink USB Serial/JTAG port (Espressif 303A:1001).");
      }

      transport = new Transport(port);
      loader = new ESPLoader({ transport, baudrate: 115200, enableTracing: false });

      setStatus("Automatically preparing the X4 Pro for installation...");
      // X4 Pro uses ESP32-S3 USB Serial/JTAG, which has its own automatic reset sequence.
      await loader.main("usb_reset");

      setStatus("Downloading Proink OS...");
      const fileArray = await downloadFirmware();
      const totalSize = fileArray.reduce((total, file) => total + file.data.length, 0);
      let completedFilesSize = 0;

      setStatus("Writing firmware: 0%");
      await loader.writeFlash({
        fileArray,
        flashSize: "keep",
        flashMode: "keep",
        flashFreq: "keep",
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex, written, total) => {
          const fileSize = fileArray[fileIndex].data.length;
          const percentage = Math.min(
            100,
            Math.round(((completedFilesSize + (written / total) * fileSize) / totalSize) * 100),
          );
          setProgress(percentage);
          setStatus(`Writing firmware: ${percentage}%`);

          if (written === total) {
            completedFilesSize += fileSize;
          }
        },
      });

      await transport.setRTS(true);
      await new Promise((resolve) => window.setTimeout(resolve, 100));
      await loader.after("hard_reset");
      setProgress(100);
      setStatus("Installed. Your Proink is restarting now.");
    } catch (installError) {
      console.error("Proink browser installation failed", installError);
      setError(errorMessage(installError));
      setStatus(null);
    } finally {
      if (transport) {
        await transport.disconnect().catch(() => undefined);
      }
      setInstalling(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Flash firmware</h1>

      <Card className="flash-card">
        <div className="flash-icon">
          <Usb size={22} weight="bold" />
        </div>
        <h2 className="flash-heading">Install Proink OS over USB</h2>
        <p className="flash-body">
          Connect your device with a USB cable, then choose its Proink USB Serial/JTAG port. The installer resets the
          X4 Pro and writes the firmware automatically. You do not need to press any device button.
        </p>

        {supported ? (
          <button className="btn btn-primary flash-activate" disabled={installing} onClick={install}>
            <Usb size={16} weight="bold" /> {installing ? "Installing..." : "Connect & install"}
          </button>
        ) : (
          <p className="flash-unsupported">
            <WarningCircle size={16} /> Your browser doesn't support WebSerial. Use Chrome or Edge on desktop.
          </p>
        )}

        {status && (
          <div className="flash-status" aria-live="polite">
            <span>{status}</span>
            {installing && <progress max="100" value={progress} />}
          </div>
        )}
        {error && (
          <div className="flash-error" role="alert">
            <WarningCircle size={18} weight="fill" /> <span>{error}</span>
          </div>
        )}

        <ul className="flash-notes">
          <li>
            <CheckCircle size={14} weight="fill" /> Only rewrites firmware. Your books, settings, and SD-card files
            are untouched.
          </li>
          <li>
            <CheckCircle size={14} weight="fill" /> Uses the X4 Pro's automatic USB reset. No BOOT button is needed.
          </li>
          <li>
            <CheckCircle size={14} weight="fill" /> Installs Proink OS v0.2.0.
          </li>
        </ul>
      </Card>

      <p className="flash-releases">
        See what's changed in each version on the{" "}
        <a href="https://github.com/thepropm/proink-os/releases" target="_blank" rel="noreferrer">
          releases page
        </a>
        .
      </p>
    </div>
  );
}

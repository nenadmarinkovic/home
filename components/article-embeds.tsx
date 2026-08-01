"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { ArrowsOutIcon } from "@phosphor-icons/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Control = { key: string; label: string; hint?: string; on: boolean };

type Panel = {
  slot: HTMLElement;
  controls: Control[];
  full: string;
  title: string;
};

export function ArticleEmbeds({ origins }: { origins: string[] }) {
  const { resolvedTheme } = useTheme();
  const frames = useRef<HTMLIFrameElement[]>([]);
  const theme = useRef<string | undefined>(undefined);
  const [panels, setPanels] = useState<Record<number, Panel>>({});

  const post = useCallback((frame: HTMLIFrameElement, message: unknown) => {
    frame.contentWindow?.postMessage(message, new URL(frame.src).origin);
  }, []);

  const sendTheme = useCallback(
    (frame: HTMLIFrameElement) => {
      if (theme.current) post(frame, { type: "theme", theme: theme.current });
    },
    [post],
  );

  useEffect(() => {
    const allowed = new Set(origins);
    const hosts = [
      ...document.querySelectorAll<HTMLElement>(".embed-frame[data-embed-src]"),
    ].filter((host) => {
      try {
        return allowed.has(new URL(host.dataset.embedSrc!).origin);
      } catch {
        return false;
      }
    });
    if (!hosts.length) return;

    const mount = () => {
      if (frames.current.length) return;
      frames.current = hosts.map((host) => {
        const frame = document.createElement("iframe");
        frame.src = host.dataset.embedSrc!;
        frame.title = host.dataset.embedTitle ?? "";
        frame.loading = "lazy";
        frame.allow = "geolocation";
        frame.addEventListener("load", () => sendTheme(frame));
        host.append(frame);
        host.dataset.embedMounted = "1";
        return frame;
      });
    };

    const unmount = () => {
      if (!frames.current.length) return;
      for (const frame of frames.current) frame.remove();
      for (const host of hosts) delete host.dataset.embedMounted;
      frames.current = [];
      setPanels({});
    };

    const onMessage = (event: MessageEvent) => {
      if (!allowed.has(event.origin)) return;
      const index = frames.current.findIndex(
        (frame) => frame.contentWindow === event.source,
      );
      if (index < 0) return;
      if (event.data?.type === "embed:ready") sendTheme(frames.current[index]);
      if (event.data?.type === "controls") {
        const host = hosts[index];
        const slot =
          host.parentElement?.querySelector<HTMLElement>(".embed-controls");
        if (!slot) return;
        setPanels((current) => ({
          ...current,
          [index]: {
            slot,
            controls: event.data.controls,
            full: host.dataset.embedFull ?? "",
            title: host.dataset.embedTitle ?? "",
          },
        }));
      }
    };

    mount();
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      unmount();
    };
  }, [origins, sendTheme]);

  useEffect(() => {
    theme.current = resolvedTheme;
    for (const frame of frames.current) sendTheme(frame);
  }, [resolvedTheme, sendTheme]);

  const toggle = (index: number, key: string, on: boolean) => {
    setPanels((current) => ({
      ...current,
      [index]: {
        ...current[index],
        controls: current[index].controls.map((control) =>
          control.key === key ? { ...control, on } : control,
        ),
      },
    }));
    post(frames.current[index], { type: "control", key, on });
  };

  return (
    <>
      {Object.entries(panels).map(([index, panel]) =>
        createPortal(
          <EmbedControls
            panel={panel}
            onToggle={(key, on) => toggle(Number(index), key, on)}
          />,
          panel.slot,
          index,
        ),
      )}
    </>
  );
}

function EmbedControls({
  panel,
  onToggle,
}: {
  panel: Panel;
  onToggle: (key: string, on: boolean) => void;
}) {
  const [full, setFull] = useState(false);

  return (
    <>
      {panel.controls.map((control) => (
        <Tooltip key={control.key}>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-pressed={control.on}
                className="embed-control"
                onClick={() => onToggle(control.key, !control.on)}
              />
            }
          >
            <span className="embed-control-dot" aria-hidden="true" />
            {control.label}
          </TooltipTrigger>
          <TooltipContent side="bottom">{control.hint}</TooltipContent>
        </Tooltip>
      ))}

      {panel.full && (
        <>
          <button
            type="button"
            className="embed-control embed-control-action"
            onClick={() => setFull(true)}
          >
            <ArrowsOutIcon weight="bold" className="embed-control-icon" />
            Fullscreen
          </button>

          <Dialog open={full} onOpenChange={setFull}>
            <DialogContent className="h-[92dvh] sm:h-[92vh] sm:max-h-[92vh] sm:w-[min(96vw,90rem)]">
              <DialogHeader>
                <DialogTitle>{panel.title}</DialogTitle>
              </DialogHeader>
              <iframe
                src={panel.full}
                title={panel.title}
                allow="geolocation"
                className="min-h-0 w-full flex-1 border-0"
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}

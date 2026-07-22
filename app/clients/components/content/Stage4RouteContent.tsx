import type { ReactNode } from "react";

import { ContentSection } from "~/clients/components/ui/foundation";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <ContentSection title={title}>{children}</ContentSection>;
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-5">{children}</ol>;
}

function Bullets({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}

export default function Stage4RouteContent({ routePath }: { routePath: string }) {
  switch (routePath) {
    case "/free-online-timers":
      return (
        <>
          <Section title="Four tools on one page">
            <p>
              This archived page keeps the original countdown, stopwatch, Pomodoro,
              and HIIT tools together. Choose a tab, set its values, and start that
              tool. Switching tabs does not turn the page into a shared session.
            </p>
            <p>
              For example, the countdown accepts <strong>05:00</strong> for five
              minutes. The Pomodoro defaults to 25 minutes of work and a 5-minute
              break. HIIT uses its own work, rest, round, and preparation settings.
            </p>
          </Section>
          <Section title="Tab and device limits">
            <p>
              Timing is calculated in the open browser page. Background throttling
              can delay screen updates, and device sleep can delay a sound or phase
              change. Keep the page open for completion cues. Current sessions are
              not restored after a refresh or closed tab.
            </p>
          </Section>
        </>
      );

    case "/countdown-timer":
      return (
        <>
          <Section title="Set a countdown">
            <Steps>
              <li>Enter minutes and seconds, or choose a minute preset.</li>
              <li>Press Start. Pause keeps the current remainder for resuming.</li>
              <li>Use +1:00 or -0:10 to adjust the active remaining time.</li>
              <li>Reset returns to the duration currently shown in the inputs.</li>
            </Steps>
            <p>
              A 7-minute setup can be entered as 7 minutes and 0 seconds. If you add
              one minute after it reaches 04:20, the display moves to 05:20.
            </p>
          </Section>
          <Section title="When zero is reached">
            <p>
              The display stops at zero and uses the selected sound behavior. The
              page must remain open. Browser audio rules can require an earlier click,
              and device sleep can postpone the cue. Reset does not preserve the prior
              run as history.
            </p>
          </Section>
        </>
      );

    case "/stopwatch":
      return (
        <>
          <Section title="Record elapsed time and laps">
            <p>
              Start begins an open-ended measurement. Lap records the elapsed value
              without stopping the watch. Pause holds the displayed elapsed time, and
              Start resumes from that point. Reset clears both elapsed time and laps.
            </p>
            <p>
              As an example, press Lap at 00:45 and again at 01:32. The list keeps
              both timestamps so you can compare the 45-second first segment with the
              47-second second segment. Copy laps exports the visible list.
            </p>
          </Section>
          <Section title="Session scope">
            <p>
              The stopwatch uses the browser's monotonic timing reference. Rendering
              may slow in a background tab, but the elapsed value reconciles when the
              page runs again. Laps are held only in this tab and disappear after a
              refresh or close.
            </p>
          </Section>
        </>
      );

    case "/pomodoro-timer":
      return (
        <>
          <Section title="Build the work and break cycle">
            <p>
              Set Work, Break, and Cycles before starting. Each cycle begins with a
              work phase. A short break follows completed work phases. When a long
              break is enabled, its configured interval and duration replace the
              short break at that point.
            </p>
            <p>
              With Work at 25 minutes, Break at 5 minutes, and Cycles at 4, the timer
              runs four work periods. Next moves to the following phase immediately.
              Auto starts a new phase without another press; with Auto off, the next
              phase waits in a ready state.
            </p>
          </Section>
          <Section title="Changes and completion">
            <p>
              Pause preserves the active phase and its remaining time. Reset returns
              to the first work phase using the current settings. Sound marks phase
              changes when enabled. Keep the page open because background throttling
              or device sleep can delay a transition or cue. The active cycle is not
              restored after refresh.
            </p>
          </Section>
        </>
      );

    case "/hiit-timer":
      return (
        <>
          <Section title="How the HIIT sequence runs">
            <p>
              The sequence is warm-up, alternating work and rest, then cool-down.
              Enter 0 for warm-up or cool-down to skip that phase. Rest is skipped
              after the final work interval, so the session can move directly to
              cool-down or finish.
            </p>
            <p>
              Set Warm-up to 30 seconds, Work to 40, Rest to 20, Rounds to 10, and
              Cool-down to 60. The timed session lasts 10 minutes 30 seconds: 30
              seconds of preparation, ten work periods, nine rests, and one minute to
              cool down.
            </p>
          </Section>
          <Section title="During an interval">
            <p>
              Pause holds the current phase. Start resumes it. Next ends the current
              phase early and advances the sequence. Settings remain fixed while the
              run is active. Reset returns to the first available phase and round one.
              Sound cues use browser audio, so keep the tab open and prevent device
              sleep when a cue matters.
            </p>
          </Section>
        </>
      );

    case "/online-timer":
      return (
        <>
          <Section title="Enter one duration">
            <p>
              Type a time such as <strong>05:00</strong>, or select a minute preset.
              Start begins the countdown. Pause keeps the current remainder, and
              Reset reloads the entered duration. Fullscreen enlarges the same active
              timer rather than opening a separate session.
            </p>
            <p>
              Use this route for a single general countdown. The Countdown Timer adds
              direct +1:00 and -0:10 adjustments. Multiple Timers is the better fit
              when several independent deadlines must run together.
            </p>
          </Section>
          <Section title="Alarm delivery">
            <p>
              The final sound is produced by the browser when sound is enabled. An
              earlier user action may be required before audio is allowed. Background
              tabs can update less often, and a sleeping device can delay completion.
              No active run survives a refresh or closed tab.
            </p>
          </Section>
        </>
      );

    case "/classroom-timer":
      return (
        <>
          <Section title="Run a visible classroom countdown">
            <p>
              Choose a preset or enter a custom number of minutes. The title field
              changes the label shown with the timer. During a run, -1 min, +1 min,
              and +5 min adjust the remaining time without rebuilding the setup.
            </p>
            <p>
              For a 12-minute activity, enter 12 and set the title to Group work.
              Start the timer, then add five minutes if the activity is extended. The
              display changes to reflect the new deadline.
            </p>
          </Section>
          <Section title="Display behavior">
            <p>
              Pause holds the current remainder. Reset returns to the selected class
              duration. Fullscreen keeps the label and large time visible. The page
              has no student accounts, remote controls, or durable class history.
              Device sleep can delay both the display and any completion sound.
            </p>
          </Section>
        </>
      );

    case "/meeting-timer":
      return (
        <>
          <Section title="Set the meeting timebox">
            <p>
              Pick a preset or enter custom minutes before starting. The duration
              controls are disabled during an active run. Pause first if the timebox
              needs to change, then choose the new value and resume or restart.
            </p>
            <p>
              A seven-minute setup counts down from 07:00. The configured warning
              changes the display near the end, and sound can mark completion. Reset
              restores the selected duration and clears the running state.
            </p>
          </Section>
          <Section title="Which meeting tool fits">
            <p>
              This page handles one countdown. Meeting Agenda Timer assigns minutes
              to ordered agenda items. Meeting Count Up Timer records elapsed topic
              markers instead of counting toward a fixed finish. The current meeting
              countdown is held only in this tab and is lost on refresh.
            </p>
          </Section>
        </>
      );

    case "/exam-timer":
      return (
        <>
          <Section title="Configure a timed section">
            <p>
              Choose a minute preset or enter a custom duration. Optional warning
              controls can mark the five-minute and one-minute points. Final beeps
              apply only to the last seconds when enabled.
            </p>
            <p>
              For a 25-minute practice section, choose 25 minutes and enable both
              warnings. Pause stops the current countdown without clearing it. Reset
              returns to 25:00 and restores the warning schedule for a new attempt.
            </p>
          </Section>
          <Section title="Use limits">
            <p>
              This is a browser timer, not an exam administration system. It does not
              lock the device, collect answers, or keep an attempt record. Fullscreen
              only changes the display. Keep the page open because device sleep can
              delay warnings and completion audio.
            </p>
          </Section>
        </>
      );

    case "/focus-session-timer":
      return (
        <>
          <Section title="One fixed focus block">
            <p>
              Select a preset or enter the number of minutes, then start a single
              countdown. A 45-minute session runs once and stops at zero. It does not
              add breaks, cycles, tasks, or notes.
            </p>
            <p>
              Pause keeps the current remainder. Reset restores the chosen duration.
              Use Pomodoro Timer when work and break phases should repeat, or Study
              Stopwatch when the session should run upward without a preset end.
            </p>
          </Section>
          <Section title="Browser note">
            <p>
              Sound depends on browser audio permission and an open page. Background
              throttling can delay a visual update, while device sleep can postpone
              the final cue. The running session is not saved after refresh.
            </p>
          </Section>
        </>
      );

    case "/drink-water-reminder-timer":
      return (
        <>
          <Section title="Repeat an interval reminder">
            <p>
              Choose an interval such as 30 or 60 minutes and start the cycle. When
              the interval ends, the page gives the selected cue and begins the next
              interval. Remind now triggers the current reminder without changing the
              configured interval.
            </p>
            <p>
              With a 60-minute interval, each completed hour starts another 60-minute
              countdown until you reset the cycle. This page provides general timing
              only. It does not set a hydration target or make a health recommendation.
            </p>
          </Section>
          <Section title="Reminder limits">
            <p>
              The reminder is not a system notification or background service. Leave
              the tab open. Browser throttling and device sleep can delay a cue, and
              refreshing the page clears the active cycle.
            </p>
          </Section>
        </>
      );

    case "/egg-timer":
      return (
        <>
          <Section title="Choose or adjust a preset">
            <p>
              Soft, Jammy, Medium, Hard, and Very hard load different countdown
              values. You can change minutes and seconds after choosing a preset. The
              selected value remains a timer setting, not a cooking guarantee.
            </p>
            <p>
              Choose Jammy to load its preset, then add 30 seconds if you want a later
              check. Start begins that exact countdown. Pause holds it, and Reset
              returns to the edited value. Final beeps apply near zero when enabled.
            </p>
          </Section>
          <Section title="What affects the result">
            <p>
              Egg size, starting temperature, altitude, cookware, and heating method
              can change cooking time. Check the food directly and follow appropriate
              food-safety guidance. The browser cue can be delayed if the device sleeps.
            </p>
          </Section>
        </>
      );

    case "/emom-timer":
      return (
        <>
          <Section title="Minute rounds">
            <p>
              Set the total number of minutes and an optional preparation countdown.
              After preparation, each new minute advances the round. The display shows
              the active round and the seconds remaining in that minute.
            </p>
            <p>
              Set 12 minutes with 10 seconds of prep. The tool counts down the prep,
              then runs rounds 1 through 12 on consecutive minute boundaries. It ends
              after the twelfth minute. Reset returns to preparation and round one.
            </p>
          </Section>
          <Section title="Cues and scheduling">
            <p>
              Sound can mark minute changes and completion. The timer does not count
              exercises or repetitions. Browser scheduling drives the cues, so a
              hidden tab or sleeping device can delay them. Keep the page active when
              minute boundaries must be heard.
            </p>
          </Section>
        </>
      );

    case "/amrap-timer":
      return (
        <>
          <Section title="One deadline with manual counters">
            <p>
              Choose the total duration and optional preparation time. The countdown
              runs once. Use the round and repetition controls to record work as it
              happens; the app does not infer movement from the timer.
            </p>
            <p>
              For a 12-minute session with 10 seconds of prep, start after setting the
              duration. If you complete three full rounds and eight more repetitions,
              record 3 rounds and 8 reps before the timer reaches zero. Reset all
              clears the countdown and the manual counters.
            </p>
          </Section>
          <Section title="What the result means">
            <p>
              The displayed round and repetition totals are entries from this session,
              not verified performance measurements. They are not saved after a
              refresh. Device sleep can delay the visible finish and any browser sound.
            </p>
          </Section>
        </>
      );

    case "/breathing-timer":
      return (
        <>
          <Section title="Set the breathing phases">
            <p>
              A preset fills the inhale, hold, exhale, and optional second-hold values.
              Custom lets you enter each phase directly. The timer advances through
              nonzero phases in order and repeats the sequence until the session ends.
            </p>
            <p>
              Box 4-4-4-4 runs four seconds for every phase. One cycle lasts 16 seconds.
              A zero-second hold is skipped, so a 4-second inhale and 6-second exhale
              can alternate without a pause phase.
            </p>
          </Section>
          <Section title="General timing only">
            <p>
              Pause holds the current phase. Reset returns to the first configured
              phase. This page does not provide medical treatment or assess breathing.
              Stop if the pattern is uncomfortable. Screen updates and sounds can be
              delayed when the tab is hidden or the device sleeps.
            </p>
          </Section>
        </>
      );

    case "/pace-timer":
      return (
        <>
          <Section title="Turn pace into timed cues">
            <p>
              Choose Running or Rowing, select kilometers or miles, then enter target
              pace, total distance, and cue interval. The tool calculates an expected
              finish time and schedules beeps at the chosen distance interval.
            </p>
            <p>
              A 5:00 per kilometer pace over 5 kilometers produces a 25:00 target.
              With a 1-kilometer cue interval, the schedule marks 5:00, 10:00, 15:00,
              20:00, and the 25:00 finish.
            </p>
          </Section>
          <Section title="Pace assumptions">
            <p>
              The schedule assumes an even pace. It does not read GPS, speed, stroke
              rate, or distance from a device. Reset returns to the configured target.
              Audio timing depends on the browser and output device, so it is not a
              calibrated pacing system.
            </p>
          </Section>
        </>
      );

    case "/pizza-timer":
      return (
        <>
          <Section title="Preset, check point, and finish">
            <p>
              Choose a method preset or set custom minutes and seconds. The early
              check value schedules a reminder before the final deadline. Repeating
              reminder mode can continue its selected pattern after that check point.
            </p>
            <p>
              Frozen oven 14m loads a 14-minute countdown. With an early check set to
              2 minutes, the check reminder occurs at 12:00 elapsed, leaving two
              minutes before the final cue. Reset restores the loaded or edited time.
            </p>
          </Section>
          <Section title="Kitchen limitation">
            <p>
              Presets are starting values. Appliance temperature, product thickness,
              starting temperature, and cookware affect heating time. Check the food
              and follow its package instructions. Device sleep can delay browser audio.
            </p>
          </Section>
        </>
      );

    case "/chaos-timer":
      return (
        <>
          <Section title="Random durations within your range">
            <p>
              Random timer chooses one duration between Min seconds and Max seconds.
              Random interval timer chooses another duration after each completion.
              If the minimum is greater than the maximum, the tool swaps them.
            </p>
            <p>
              With a minimum of 10 and maximum of 45, every generated interval is from
              10 through 45 seconds. Reset stops the current sequence and generates
              according to the current mode. Test beep checks the selected sound path.
            </p>
          </Section>
          <Section title="Random and browser behavior">
            <p>
              Values are generated in the browser for this session. They are not
              seeded for replay and are not suitable for security, gambling, or a
              controlled experiment. Background throttling or device sleep can delay
              an interval change or beep.
            </p>
          </Section>
        </>
      );

    case "/lab-timer":
      return (
        <>
          <Section title="Two timing modes for a procedure">
            <p>
              Stopwatch mode measures open-ended elapsed time and records laps. Step
              mode counts down a selected short duration for a repeatable procedure.
              The quick second presets load the step duration.
            </p>
            <p>
              Start the stopwatch and press Lap at each observation to keep timestamps.
              For a repeated 60-second step, set 60 seconds and restart that step for
              each sample. Reset clears the active mode's current timing data.
            </p>
          </Section>
          <Section title="Recordkeeping boundary">
            <p>
              The lap list is a session aid, not a laboratory record system. Refreshing
              or closing the page removes it. Browser and input latency affect recorded
              times, and device sleep can interrupt countdown cues. Export required
              observations into the appropriate record before leaving the page.
            </p>
          </Section>
        </>
      );

    case "/meditation-timer":
      return (
        <>
          <Section title="Set a quiet session">
            <p>
              Choose a preset or enter minutes and seconds. Some presets load named
              breathing patterns, while a plain minute preset runs one countdown.
              Sound controls whether browser cues mark the session boundary.
            </p>
            <p>
              Select Breathe 7m to load seven minutes, or enter 12:00 for a custom
              session. Pause holds the current remainder. Reset restores the chosen
              duration rather than recording a completed session.
            </p>
          </Section>
          <Section title="Scope and delivery">
            <p>
              This timer provides general timing and does not make a health claim.
              Browser audio may need an initial interaction. Keep the page open, and
              note that device sleep can delay the end cue.
            </p>
          </Section>
        </>
      );

    case "/meeting-count-up-timer":
      return (
        <>
          <Section title="Mark topics on an open-ended meeting">
            <p>
              Start begins elapsed meeting time. Topic records the current timestamp
              with the label from Button label. The optional topic count is a display
              aid; it does not create timed agenda phases.
            </p>
            <p>
              Start at 00:00, press Topic at 08:30, rename the button to Decisions, and
              press it again at 21:10. The list shows when each marker was added. Reset
              clears elapsed time and all topic markers.
            </p>
          </Section>
          <Section title="Session data">
            <p>
              Topic markers remain only in the current page. Copy any values you need
              before refreshing or closing the tab. This tool counts upward; Meeting
              Timer counts toward one deadline, while Meeting Agenda Timer assigns
              separate durations to ordered items.
            </p>
          </Section>
        </>
      );

    case "/multiple-timers":
      return (
        <>
          <Section title="Run independent countdowns">
            <p>
              Each row has its own label, duration, start state, and alarm. Start all
              begins every ready timer. Reset all restores each timer's configured
              duration. Stop alarms silences any completed timers without changing
              other running rows.
            </p>
            <p>
              Set Timer A to 5 minutes and Timer B to 10 minutes. Start both together.
              Timer A reaches zero first while Timer B continues with about five
              minutes remaining. Adding or removing a row affects only that timer.
            </p>
          </Section>
          <Section title="Local restoration">
            <p>
              Timer definitions and selected state use local browser storage. There is
              no account sync or cross-tab coordination. A restored page can reconcile
              saved timing data, but a closed tab cannot deliver a durable background
              alarm. Device sleep may delay sounds until the browser resumes.
            </p>
          </Section>
        </>
      );

    case "/event-countdown":
      return (
        <>
          <Section title="Save and run dated events">
            <p>
              Enter a label and local date-time, then save the event. New creates a
              separate entry, Duplicate copies the selected setup, and Delete removes
              it from this browser. Start controls the selected event's live display;
              quick hour adjustments move its target.
            </p>
            <p>
              Create an event for 2026-08-01 at 09:00, then duplicate it and move the
              copy back two hours. The list holds both local targets. Reset restores
              the selected event's countdown state without deleting the saved entry.
            </p>
          </Section>
          <Section title="Local date and storage rules">
            <p>
              Events are stored in local browser storage and are not synced to an
              account or calendar. The target uses the device's local date and time-zone
              interpretation. A closed tab cannot deliver a durable alarm, and device
              sleep can delay the browser cue.
            </p>
          </Section>
        </>
      );

    case "/new-year-countdown":
      return (
        <>
          <Section title="Target the next January 1">
            <p>
              The page calculates the next New Year boundary in your device's local
              time zone and updates the days, hours, minutes, and seconds remaining.
              After the boundary passes, the target advances to the following year.
            </p>
            <p>
              If the device date is December 31 at 23:59:30, the display shows about
              30 seconds until local midnight. Copy and Share use the current visible
              countdown. Fullscreen changes only its size.
            </p>
          </Section>
          <Section title="Local-clock dependency">
            <p>
              The result depends on the device clock and selected local time zone. It
              does not use an official event feed. Background throttling can skip
              visible ticks, and device sleep can delay the on-screen transition.
            </p>
          </Section>
        </>
      );

    case "/utc-clock":
      return (
        <>
          <Section title="Read UTC beside selected comparisons">
            <p>
              UTC is the primary display. The local and city rows show the same instant
              in their own zones. Seconds changes display precision, while Copy exports
              the current set of readings.
            </p>
            <p>
              When UTC shows 20:00, New York might show 16:00 on a summer date and
              London 21:00. Those offsets come from the browser's time-zone data for
              the current date. UTC itself does not use daylight-saving time.
            </p>
          </Section>
          <Section title="Source and refresh behavior">
            <p>
              The page derives UTC from the device clock. It does not contact an
              official UTC service. A background tab can render fewer updates, then
              show a fresh device-clock reading when active again.
            </p>
          </Section>
        </>
      );

    case "/analog-clock":
      return (
        <>
          <Section title="Choose how the clock face moves">
            <p>
              Seconds hand shows or hides the second hand. Smooth makes that hand move
              continuously between second marks; with Smooth off, it advances in steps.
              Digital readout adds the current numeric time below the face.
            </p>
            <p>
              Turn on Seconds hand and turn off Smooth to display one step per second.
              Fullscreen enlarges the same device-time face. Copy current time exports
              the numeric reading, not an image of the clock.
            </p>
          </Section>
          <Section title="Time source">
            <p>
              The face is drawn from your device clock. It does not contact a time
              server. Background tabs may redraw less often, and fullscreen does not
              improve clock accuracy. Use Digital Clock when a large numeric display
              is more important than the dial.
            </p>
          </Section>
        </>
      );

    case "/digital-clock":
      return (
        <>
          <Section title="Set the local display">
            <p>
              Seconds toggles the seconds field. 24-hour changes the hour notation.
              Date adds the current calendar date. Minimal hides secondary controls
              from the clock presentation without changing the time source.
            </p>
            <p>
              Turn on 24-hour, Seconds, and Date to show a reading such as 18:42:07
              with its local date. Copy exports the visible clock value. Fullscreen
              enlarges the same reading.
            </p>
          </Section>
          <Section title="Device-time dependency">
            <p>
              The display reads the clock and time zone reported by your device. It is
              not synchronized with an external service. A hidden tab may render fewer
              updates, then show the current time when active again. Clock with
              Milliseconds adds a sub-second field and UTC option.
            </p>
          </Section>
        </>
      );

    case "/current-local-time":
      return (
        <>
          <Section title="Local time with quick comparisons">
            <p>
              The main value is your device's local time. The city rows show several
              fixed comparison zones at the same instant. Seconds changes display
              precision, and Copy exports the current visible values.
            </p>
            <p>
              If the local row shows 3:18 PM in New York, the London row represents
              that same moment using London's offset on the current date. Daylight
              saving rules come from the browser's time-zone data.
            </p>
          </Section>
          <Section title="Choosing another clock">
            <p>
              This page offers a small fixed comparison. World Clock lets you manage a
              larger city list. Time Zone Converter converts a chosen wall time on a
              chosen date. All values depend on the device clock and runtime time-zone
              data.
            </p>
          </Section>
        </>
      );

    case "/binary-clock":
      return (
        <>
          <Section title="Read the binary display">
            <p>
              BCD digits encodes each decimal digit separately. In a time of 12:34:56,
              the six columns represent 1, 2, 3, 4, 5, and 6. Add the lit bit weights
              in each column to recover its digit.
            </p>
            <p>
              Pure binary encodes the complete hour, minute, and second values instead
              of six decimal digits. For 10 seconds, the second value is binary 1010,
              which uses weights 8 and 2. Seconds and 24-hour settings change which
              values are included before encoding.
            </p>
          </Section>
          <Section title="Clock behavior">
            <p>
              Copy exports the encoded and standard readings. The clock uses current
              device time and redraws in the browser. It is an alternate representation,
              not a separate time source.
            </p>
          </Section>
        </>
      );

    case "/fibonacci-clock":
      return (
        <>
          <Section title="Decode the five tiles">
            <p>
              The tiles have values 1, 1, 2, 3, and 5. Hour-colored tiles add to the
              displayed hour. Minute-colored tiles add to the minute value after the
              clock rounds minutes to a five-minute step. A tile can contribute to
              both sums when the color indicates both.
            </p>
            <p>
              Explore mode lets you enter a time without waiting for it. For 08:25,
              the hour tiles must total 8 and the minute tiles must total 5, because
              25 divided by 5 equals 5. The standard readout remains visible for
              comparison.
            </p>
          </Section>
          <Section title="Representation limits">
            <p>
              Minutes are shown in five-minute increments, so this is not a precise
              minute-by-minute reference. Live mode uses the selected device or named
              time zone. Fullscreen and Copy do not change the calculation.
            </p>
          </Section>
        </>
      );

    case "/hexadecimal-clock":
      return (
        <>
          <Section title="Convert the clock values to base 16">
            <p>
              Hex HH:MM:SS converts each current hour, minute, and second value from
              decimal to hexadecimal. Decimal 15 becomes F, 16 becomes 10, and 31
              becomes 1F. Milliseconds adds a converted sub-second field.
            </p>
            <p>
              At decimal time 14:30:45, the hexadecimal reading is 0E:1E:2D. Hex color
              mode uses time-derived byte values to form a #RRGGBB color code. It is a
              visual encoding, not a standard civil-time notation.
            </p>
          </Section>
          <Section title="Source and precision">
            <p>
              The inputs come from the device clock. Browser rendering limits the
              visible millisecond field, and a background tab may update less often.
              Copy exports the current encoded value.
            </p>
          </Section>
        </>
      );

    case "/morse-code-clock":
      return (
        <>
          <Section title="Read each time digit as Morse code">
            <p>
              Every decimal digit in the current time maps to its five-symbol Morse
              numeral. For example, 1 is .---- and 2 is ..---. A time beginning 12
              therefore begins with those two groups.
            </p>
            <p>
              Text view prints dots and dashes. The block view draws the same symbols
              visually. 24-hour changes the hour digits before conversion, and Seconds
              includes or removes the final two digit groups.
            </p>
          </Section>
          <Section title="Current-time source">
            <p>
              This page encodes the device's current clock reading. It does not send
              or play Morse audio. Copy exports the visible text form, and fullscreen
              changes only the presentation.
            </p>
          </Section>
        </>
      );

    case "/minimalist-clock":
      return (
        <>
          <Section title="Reduce the clock display">
            <p>
              Seconds, 24-hour, and Date control which parts of local time are shown.
              Zen hides the surrounding controls after interaction so the time remains
              the main visible element. Moving or interacting brings controls back.
            </p>
            <p>
              Turn off Seconds and Date, enable Zen, then enter fullscreen for an
              hours-and-minutes display. Copy still exports the current clock value.
            </p>
          </Section>
          <Section title="What minimal mode does not change">
            <p>
              Zen is a presentation setting. The clock still reads device time, and a
              background tab can render less often. Digital Clock provides the same
              core time with more controls kept visible.
            </p>
          </Section>
        </>
      );

    case "/world-clock":
      return (
        <>
          <Section title="Compare selected cities at one instant">
            <p>
              Add cities to the list and remove rows you no longer need. Every row is
              calculated for the same current instant, using that city's IANA time
              zone. The date can differ across rows near midnight.
            </p>
            <p>
              Add New York, London, and Tokyo. If New York shows Monday evening,
              Tokyo may already show Tuesday morning. The difference reflects each
              zone's offset on the current date, including runtime daylight-saving rules.
            </p>
          </Section>
          <Section title="Clock versus conversion">
            <p>
              World Clock follows now. Time Zone Converter accepts a chosen date and
              wall time, while Meeting Planner checks one proposed meeting across
              several zones. This page depends on the device clock and browser time-zone
              database. Its city list is not an account-synced schedule.
            </p>
          </Section>
        </>
      );

    case "/epoch-unix-time-clock":
      return (
        <>
          <Section title="Read the live Unix values">
            <p>
              Seconds shows whole seconds since 1970-01-01 00:00:00 UTC. Milliseconds
              shows the same instant at one-thousandth-second scale. Freeze holds the
              displayed sample. Snap now replaces it with a fresh device-clock value.
            </p>
            <p>
              A seconds value of 1,700,000,000 corresponds to a milliseconds value of
              1,700,000,000,000. The page also renders UTC and local date forms for the
              sampled instant. Copy seconds and Copy milliseconds keep the units explicit.
            </p>
          </Section>
          <Section title="Live display limits">
            <p>
              This clock reads the device clock and is not a network time source.
              Whole seconds are truncated from the millisecond value. Browser rendering
              can skip visible increments, especially in a background tab, without
              changing the meaning of the next sampled timestamp.
            </p>
          </Section>
        </>
      );

    case "/atomic-clock":
      return (
        <>
          <Section title="Use the device-time display">
            <p>
              Live follows the device clock. Freeze holds one displayed reading, and
              Snap returns to a fresh current value. Hide ms removes the millisecond
              field from view without changing the underlying time source.
            </p>
            <p>
              Freeze at 14:08:31.245 to inspect that rendered value, then select Live
              to resume current readings. The page does not connect to an atomic clock,
              NTP service, or official time server.
            </p>
          </Section>
        </>
      );

    case "/golden-hour-clock":
      return (
        <>
          <Section title="Select a place, date, and definition">
            <p>
              Enter valid latitude and longitude values or use the device location
              control. Classic uses fixed 60-minute windows around the calculated
              sunrise and sunset. Solar-angle mode uses the configured solar elevation
              boundaries. Today restores the current date.
            </p>
            <p>
              For latitude 40.7128 and longitude -74.006 on a selected date, the page
              calculates morning and evening windows locally. The countdown targets
              the next boundary shown by that calculation. Invalid coordinates do not
              silently fall back to a different location.
            </p>
          </Section>
        </>
      );

    case "/moon-phase-clock":
      return (
        <>
          <Section title="Inspect a selected lunar-cycle estimate">
            <p>
              Live uses the current device date and time. Manual mode accepts a date,
              hour, and minute. Set to noon provides a stable midday lookup, while Now
              returns to the current instant. The display estimates phase name, lunar
              age, illumination, and time to the next major phase.
            </p>
            <p>
              Changing the hour on one date moves the position within the same modeled
              synodic cycle. Sound applies to the countdown boundary only. The result
              is an approximation and is not an observational ephemeris.
            </p>
          </Section>
        </>
      );

    case "/astronomical-clock":
      return (
        <>
          <Section title="Combine the saved location with device time">
            <p>
              Choose a listed city or use device location. The selected latitude,
              longitude, and IANA time zone drive the local solar and lunar estimates.
              Clear location removes the saved location values from this browser.
            </p>
            <p>
              Selecting New York loads its location and zone, then shows calculated
              solar events and the modeled moon state for the current date. Choosing
              London changes both the coordinates and the civil-time basis. These are
              disclosed approximations rather than broad observational validation.
            </p>
          </Section>
        </>
      );

    case "/binary-stopwatch":
      return (
        <>
          <Section title="Measure time in binary">
            <p>
              Stopwatch mode counts upward. Timer mode counts down from its configured
              value and can use a completion sound. Weights labels the bit positions,
              Practice exposes a learning view, and Dim reduces inactive-bit contrast.
            </p>
            <p>
              At 10 elapsed seconds, the seconds field is 1010 because the active
              weights are 8 and 2. Pause holds the elapsed or remaining value. Reset
              clears the run and restores the selected mode's starting value.
            </p>
          </Section>
          <Section title="Measurement and storage">
            <p>
              Binary changes the representation, not the timing source. Browser input
              and rendering latency affect what you see. The current run is held in
              memory and does not survive a refresh.
            </p>
          </Section>
        </>
      );

    case "/military-time-converter":
      return (
        <>
          <Section title="Convert in either direction">
            <p>
              Enter four-digit 24-hour time on the left or a 12-hour time with AM or
              PM on the right. The converter validates the civil-time ranges before
              producing the paired value.
            </p>
            <Bullets>
              <li>0000 converts to 12:00 AM.</li>
              <li>1200 converts to 12:00 PM.</li>
              <li>1730 converts to 5:30 PM.</li>
              <li>5:30 AM converts to 0530.</li>
            </Bullets>
            <p>
              The input 2400 is handled as the end-of-day notation documented on the
              page. Other hours above 23 or minutes above 59 are invalid. This tool
              converts notation only and does not apply a time zone.
            </p>
          </Section>
        </>
      );

    case "/milliseconds-converter":
      return (
        <>
          <Section title="Convert exact decimal units">
            <p>
              Milliseconds to seconds divides by 1,000. Seconds to milliseconds
              multiplies by 1,000. The converter uses decimal arithmetic for the value
              entered and does not treat it as a date or timestamp.
            </p>
            <Bullets>
              <li>16.67 milliseconds becomes 0.01667 seconds.</li>
              <li>1,500 milliseconds becomes 1.5 seconds.</li>
              <li>2.25 seconds becomes 2,250 milliseconds.</li>
            </Bullets>
            <p>
              Reset returns to 1,000 milliseconds. Copy uses the current result. Use
              Unix Timestamp Converter when the number represents an instant since the
              Unix epoch rather than a duration.
            </p>
          </Section>
        </>
      );

    case "/time-zone-converter":
      return (
        <>
          <Section title="Convert a wall time on a specific date">
            <p>
              Enter the date and clock time in the source zone, then choose the target
              zone. The result identifies one instant and displays it in both zones.
              The date matters because offsets can change with daylight-saving rules.
            </p>
            <p>
              For example, 2026-07-21 at 09:00 in America/New_York converts to 14:00
              in Europe/London. A winter date can have a different offset relationship.
              The page rejects impossible calendar dates and reports nonexistent wall
              times during a clock-forward transition.
            </p>
          </Section>
          <Section title="Ambiguous times and saved inputs">
            <p>
              A repeated fall-back wall time can name two instants. The converter uses
              its documented earlier-occurrence policy and shows an ambiguity warning.
              Valid URL parameters override locally stored preferences. Results depend
              on the runtime's IANA time-zone data.
            </p>
          </Section>
        </>
      );

    case "/date-calculator":
      return (
        <>
          <Section title="Add or subtract calendar units">
            <p>
              Select a start date, choose Add or Subtract, and enter the day, week,
              month, and year amounts. The result applies calendar units rather than
              treating every month as a fixed number of days.
            </p>
            <p>
              Starting on 2026-01-01 and adding 10 days gives 2026-01-11. Adding one
              month uses the corresponding calendar month and the calculator's visible
              end-of-month handling. Negative values are not a substitute for changing
              the Add or Subtract setting.
            </p>
          </Section>
          <Section title="Date boundaries">
            <p>
              The calculation uses calendar dates and returns a date, not elapsed hours.
              Time zones and daylight-saving changes do not add or remove a calendar
              day from this result. Use Date Duration Calculator to measure the span
              between two dates.
            </p>
          </Section>
        </>
      );

    case "/age-calculator":
      return (
        <>
          <Section title="Age on the selected date">
            <p>
              Enter the birth date and the date on which age should be calculated. The
              result counts completed years first, then the remaining months and days.
            </p>
            <p>
              A birth date of 2000-01-01 and an age-on date of 2026-07-21 produces 26
              completed years plus the remaining calendar span from January 1 to July
              21. A future birth date is invalid.
            </p>
          </Section>
          <Section title="Calendar interpretation">
            <p>
              This is calendar age, not an exact elapsed-hour total. Month lengths and
              leap years affect the remainder. The input contains dates only, so birth
              time and time zone are not part of the calculation.
            </p>
          </Section>
        </>
      );

    case "/debt-clock":
      return (
        <>
          <Section title="Project a balance from two assumptions">
            <p>
              Enter a starting balance, yearly change, source label, and currency. The
              display applies a constant per-millisecond rate from the yearly change to
              the elapsed time since reset. Pause holds the current projection.
            </p>
            <p>
              A starting balance of 1,000 with yearly change of 365 projects about one
              unit per day under the tool's 365-day convention. After 10 days, the
              display is about 1,010 before currency rounding.
            </p>
          </Section>
        </>
      );

    case "/debt-repayment-timer":
      return (
        <>
          <Section title="Interpolate toward a target date">
            <p>
              Set a starting balance, target balance, start date, and payoff date. The
              large display moves linearly between the two balances as time passes.
              Duration is another way to set the finish date.
            </p>
            <p>
              Starting at 5,000 and ending at 0 over 100 days reduces the projection
              by 50 per day. At day 40, the displayed estimate is about 3,000. Reset
              returns to the entered starting assumptions.
            </p>
          </Section>
        </>
      );

    default:
      return null;
  }
}

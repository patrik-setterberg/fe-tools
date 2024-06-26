import { useEffect, useState, useRef } from "react";
import clsx from "clsx/lite";

// Components
import Instructions from "./Instructions";
import NumberInputWithSelect from "./NumberInputWithSelect";
import CopyButton from "./CopyButton";
import MessageList from "./MessageList";

// Store
import { useStore } from "../store/uiToolsStore";

// Helpers
import generateClamp from "../helpers/generateClamp";
import selectText from "../helpers/selectText";

// Assets
import angleup from "../assets/images/angleup.svg";
import angleupDarkMode from "../assets/images/angleup-dark-mode.svg";
import error from "../assets/images/error.svg";
import info from "../assets/images/info.svg";

/**
 * A component that generates a CSS clamp value based on user input.
 *
 * @returns The rendered ClampGenerator component.
 */
const ClampGenerator = (): JSX.Element => {
    // Theme state.
    const theme = useStore((state) => state.theme);

    // Show instructions state.
    const { showInstructions } = useStore((state) => ({
        showInstructions: state.showInstructions,
    }));

    // The minimum viewport width value.
    const { minViewportWidth, setMinViewportWidth } = useStore((state) => ({
        minViewportWidth: state.minViewportWidth,
        setMinViewportWidth: state.setMinViewportWidth,
    }));

    // The unit of the minimum viewport width.
    const { minViewportWidthUnit, setMinViewportWidthUnit } = useStore(
        (state) => ({
            minViewportWidthUnit: state.minViewportWidthUnit,
            setMinViewportWidthUnit: state.setMinViewportWidthUnit,
        }),
    );

    // The maximum viewport width value.
    const { maxViewportWidth, setMaxViewportWidth } = useStore((state) => ({
        maxViewportWidth: state.maxViewportWidth,
        setMaxViewportWidth: state.setMaxViewportWidth,
    }));

    // The unit of the maximum viewport width.
    const { maxViewportWidthUnit, setMaxViewportWidthUnit } = useStore(
        (state) => ({
            maxViewportWidthUnit: state.maxViewportWidthUnit,
            setMaxViewportWidthUnit: state.setMaxViewportWidthUnit,
        }),
    );

    //The minimum value for the clamp.
    const { minValue, setMinValue } = useStore((state) => ({
        minValue: state.minValue,
        setMinValue: state.setMinValue,
    }));

    // The unit of the minimum value for the clamp.
    const { minValueUnit, setMinValueUnit } = useStore((state) => ({
        minValueUnit: state.minValueUnit,
        setMinValueUnit: state.setMinValueUnit,
    }));

    // The maximum value for the clamp.
    const { maxValue, setMaxValue } = useStore((state) => ({
        maxValue: state.maxValue,
        setMaxValue: state.setMaxValue,
    }));

    // The unit of the maximum value for the clamp.
    const { maxValueUnit, setMaxValueUnit } = useStore((state) => ({
        maxValueUnit: state.maxValueUnit,
        setMaxValueUnit: state.setMaxValueUnit,
    }));

    // The base font size in pixels for calculating rem values.
    const { remSize } = useStore((state) => ({
        remSize: state.remSize,
    }));

    // The generated clamp value.
    const { clampValue, setClampValue } = useStore((state) => ({
        clampValue: state.clampValue,
        setClampValue: state.setClampValue,
    }));

    // Messages (error, caution) handling.
    const { setHasErrors } = useStore((state) => ({
        hasErrors: state.hasErrors,
        setHasErrors: state.setHasErrors,
    }));

    type Fields = {
        minViewportWidth?: string;
        maxViewportWidth?: string;
        minValue?: string;
        maxValue?: string;
        remSize?: string;
    };

    const [errors, setErrors] = useState<Fields>({});
    const [errorMessages, setErrorMessages] = useState("");

    // We set error messages when the errors object changes.
    useEffect(() => {
        setErrorMessages(
            Object.values(errors)
                .filter((error, index, self) => self.indexOf(error) === index)
                .join("\n"),
        );
    }, [errors]);

    useEffect(() => {
        setHasErrors(!!errorMessages);
    }, [errorMessages]);

    const [cautions, setCautions] = useState<Fields>({});
    const [cautionMessages, setCautionMessages] = useState("");

    // Similarly we set caution messages when the errors object changes.
    useEffect(() => {
        setCautionMessages(
            Object.values(cautions)
                .filter(
                    (caution, index, self) => self.indexOf(caution) === index,
                )
                .join("\n"),
        );
    }, [cautions]);

    const [copySuccess, setCopySuccess] = useState(false);

    /**
     * Handle the form submission event:
     * Copies the clamp value to the clipboard.
     * @param event - The form submission event.
     */
    const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        navigator.clipboard.writeText(clampValue).then(
            function () {
                setCopySuccess(true);
                setTimeout(() => {
                    setCopySuccess(false);
                }, 2000);
            },
            function (err) {
                console.error(err);
            },
        );
    };

    useEffect(() => {
        setErrors({});

        const {
            result,
            errors: newErrors,
            cautions: newCautions,
        } = generateClamp(
            minViewportWidth,
            minViewportWidthUnit,
            maxViewportWidth,
            maxViewportWidthUnit,
            minValue,
            minValueUnit,
            maxValue,
            maxValueUnit,
            remSize,
        );

        if (newErrors) {
            const errorObject: Fields = newErrors.reduce((acc, curr) => {
                return { ...acc, [curr.param]: curr.message };
            }, {});

            setErrors(errorObject);
        } else {
            typeof result === "string" && setClampValue(result);
        }

        if (newCautions) {
            const cautionObject: Fields = newCautions.reduce((acc, curr) => {
                return { ...acc, [curr.param]: curr.message };
            }, {});
            setCautions(cautionObject);
        }
    }, [minViewportWidth, maxViewportWidth, minValue, maxValue]);

    // Create ref for first input (minViewportWidth).
    const minViewportWidthInputRef = useRef<HTMLInputElement>(null);

    // Focus the first input when the instructions are hidden.
    useEffect(() => {
        !showInstructions && minViewportWidthInputRef.current?.focus();
    }, [showInstructions]);

    return (
        <>
            <div className="mb-6 flex items-center gap-4">
                <div
                    className={clsx(
                        "bg-gray-silver dark:bg-gray-dark rounded-md p-2",
                        "transition-colors duration-100 ease-out",
                    )}
                >
                    <img
                        src={theme === "dark" ? angleupDarkMode : angleup}
                        alt="Angle up icon"
                        aria-hidden="true"
                    />
                </div>
                <div>
                    <h2
                        className={clsx(
                            "text-almost-black tracking-wider text-lg font-semibold dark:text-white",
                            "transition-colors duration-100 ease-out",
                        )}
                    >
                        Generate clamp()
                    </h2>
                </div>
            </div>
            {showInstructions && <Instructions />}
            <form
                onSubmit={submitHandler}
                className="mt-10 grid grid-cols-2 gap-x-3 gap-y-4"
            >
                <NumberInputWithSelect
                    ref={minViewportWidthInputRef}
                    label="Min viewport width"
                    inputValue={String(minViewportWidth)}
                    inputOnChange={setMinViewportWidth}
                    selectValue={minViewportWidthUnit}
                    selectOnChange={setMinViewportWidthUnit}
                    error={errors.minViewportWidth !== undefined}
                    caution={cautions.minViewportWidth !== undefined}
                />
                <NumberInputWithSelect
                    label="Max viewport width"
                    inputValue={String(maxViewportWidth)}
                    inputOnChange={setMaxViewportWidth}
                    selectValue={maxViewportWidthUnit}
                    selectOnChange={setMaxViewportWidthUnit}
                    error={errors.maxViewportWidth !== undefined}
                    caution={cautions.maxViewportWidth !== undefined}
                />
                <NumberInputWithSelect
                    label="Min value"
                    inputValue={String(minValue)}
                    inputOnChange={setMinValue}
                    selectValue={minValueUnit}
                    selectOnChange={setMinValueUnit}
                    error={errors.minValue !== undefined}
                    caution={cautions.minValue !== undefined}
                />
                <NumberInputWithSelect
                    label="Max value"
                    inputValue={String(maxValue)}
                    inputOnChange={setMaxValue}
                    selectValue={maxValueUnit}
                    selectOnChange={setMaxValueUnit}
                    error={errors.maxValue !== undefined}
                    caution={cautions.maxValue !== undefined}
                />
                {!!errorMessages && (
                    <MessageList
                        messages={errorMessages}
                        type="error"
                        icon={error}
                    />
                )}
                {!errorMessages && !!cautionMessages && (
                    <MessageList
                        messages={cautionMessages}
                        type="caution"
                        icon={info}
                    />
                )}
                {!errorMessages && !!clampValue && (
                    <div
                        className={clsx(
                            "col-span-2 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0",
                            cautionMessages ? "mt-2" : "mt-6",
                        )}
                    >
                        <code
                            className={clsx(
                                "bg-gray-silver dark:bg-gray-dark text-almost-black max-w-full flex-grow overflow-x-auto whitespace-nowrap rounded-bl-md rounded-tl-md px-4 py-3 text-sm max-sm:w-full max-sm:rounded-md sm:py-2.5 sm:text-base dark:text-white",
                                "transition-colors duration-100 ease-out",
                            )}
                            onClick={selectText}
                        >
                            {clampValue}
                        </code>

                        <CopyButton copySuccess={copySuccess} />
                    </div>
                )}
            </form>
        </>
    );
};

export default ClampGenerator;

'use client';

import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import type {
  GestureResponderEvent,
  PressableProps,
  TextInputProps,
  ViewProps,
} from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

const InputContext = React.createContext<{
  inputRef: React.MutableRefObject<TextInput | null>;
  disabled?: boolean;
  readOnly?: boolean;
}>({
  inputRef: { current: null },
});

const inputStyle = tva({
  base: 'h-9 w-full flex-row items-center rounded-md border border-border dark:bg-input/30 bg-transparent shadow-xs transition-[color,box-shadow] overflow-hidden data-[focus=true]:outline-none data-[focus=true]:border-ring dark:data-[focus=true]:border-ring data-[focus=true]:web:ring-[3px] data-[focus=true]:web:ring-ring/50 data-[invalid=true]:border-destructive/40 dark:data-[invalid=true]:border-destructive/40 data-[invalid=true]:web:ring-destructive/20 dark:data-[invalid=true]:web:ring-destructive/40 data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 px-3 gap-2',
});

const inputIconStyle = tva({
  base: 'justify-center items-center text-muted-foreground fill-none h-4 w-4',
});

const inputSlotStyle = tva({
  base: 'justify-center items-center web:disabled:cursor-not-allowed',
});

const inputFieldStyle = tva({
  base: 'flex-1 text-foreground text-sm md:text-sm py-1 h-full placeholder:text-muted-foreground web:outline-none ios:leading-[0px] web:cursor-text web:data-[disabled=true]:cursor-not-allowed',
});

type InputProps = ViewProps &
  VariantProps<typeof inputStyle> & {
    className?: string;
    isDisabled?: boolean;
    isReadOnly?: boolean;
  };

const Input = React.forwardRef<View, InputProps>(
  function Input({ className, children, isDisabled, isReadOnly, ...props }, ref) {
    const inputRef = React.useRef<TextInput | null>(null);

    return (
      <InputContext.Provider
        value={{
          inputRef,
          disabled: isDisabled,
          readOnly: isReadOnly,
        }}
      >
        <View
          ref={ref}
          {...props}
          className={inputStyle({ class: className })}
          dataSet={{
            disabled: isDisabled ? 'true' : 'false',
            readonly: isReadOnly ? 'true' : 'false',
          }}
        >
          {children}
        </View>
      </InputContext.Provider>
    );
  }
);

type InputIconProps = {
  as?: React.ElementType;
  className?: string;
  height?: number;
  width?: number;
  size?: number;
  color?: string;
  [key: string]: unknown;
};

const InputIcon = React.forwardRef<any, InputIconProps>(
  function InputIcon({ as: Icon, className, height, width, size, ...props }, ref) {
    if (!Icon) return null;

    return (
      <Icon
        ref={ref}
        {...props}
        size={size ?? height ?? width ?? 18}
        className={inputIconStyle({ class: className })}
      />
    );
  }
);

type InputSlotProps = PressableProps &
  VariantProps<typeof inputSlotStyle> & {
    className?: string;
    focusOnPress?: boolean;
  };

const InputSlot = React.forwardRef<View, InputSlotProps>(
  function InputSlot({ className, children, focusOnPress = true, onPress, ...props }, ref) {
    const { inputRef, disabled } = React.useContext(InputContext);

    const handlePress = (event: GestureResponderEvent) => {
      onPress?.(event);
      if (focusOnPress) {
        inputRef.current?.focus();
      }
    };

    return (
      <Pressable
        ref={ref}
        {...props}
        disabled={disabled || props.disabled}
        className={inputSlotStyle({ class: className })}
        onPress={handlePress}
      >
        {children}
      </Pressable>
    );
  }
);

type InputFieldProps = TextInputProps &
  VariantProps<typeof inputFieldStyle> & {
    className?: string;
    readOnly?: boolean;
    isReadOnly?: boolean;
    isDisabled?: boolean;
  };

const InputField = React.forwardRef<TextInput, InputFieldProps>(
  function InputField(
    { className, editable, readOnly, isReadOnly, isDisabled, ...props },
    ref
  ) {
    const context = React.useContext(InputContext);
    const disabled = isDisabled || context.disabled;
    const readonly = readOnly || isReadOnly || context.readOnly;

    const setRef = React.useCallback(
      (node: TextInput | null) => {
        context.inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [context.inputRef, ref]
    );

    return (
      <TextInput
        ref={setRef}
        {...props}
        editable={editable ?? (!disabled && !readonly)}
        className={inputFieldStyle({ class: className })}
        dataSet={{
          disabled: disabled ? 'true' : 'false',
          readonly: readonly ? 'true' : 'false',
        }}
      />
    );
  }
);

Input.displayName = 'Input';
InputIcon.displayName = 'InputIcon';
InputSlot.displayName = 'InputSlot';
InputField.displayName = 'InputField';

export { Input, InputField, InputIcon, InputSlot };

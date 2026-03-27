import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PasswordInput } from "./password-input";
import { createRef } from "react";

describe("PasswordInput Component", () => {
  it("should render password input with masked text by default", () => {
    render(<PasswordInput placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
  });

  it("should toggle password visibility when button is clicked", () => {
    render(<PasswordInput placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    // Initially password type
    expect(input).toHaveAttribute("type", "password");

    // Click to show password
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();

    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "password");
  });

  it("should apply error styling when error prop is true", () => {
    render(<PasswordInput error={true} placeholder="Test password" />);
    const input = screen.getByPlaceholderText("Test password") as HTMLInputElement;
    expect(input.className).toContain("border-red-500");
  });

  it("should not apply error styling when error prop is false", () => {
    render(<PasswordInput error={false} placeholder="Test password" />);
    const input = screen.getByPlaceholderText("Test password") as HTMLInputElement;
    expect(input.className).toContain("border-slate-200");
    expect(input.className).not.toContain("border-red-500");
  });

  it("should pass value and onChange props correctly", () => {
    const handleChange = jest.fn();
    render(
      <PasswordInput
        value="mypassword"
        onChange={handleChange}
        placeholder="Enter password"
      />
    );
    const input = screen.getByPlaceholderText("Enter password");
    
    expect(input).toHaveValue("mypassword");
    
    fireEvent.change(input, { target: { value: "newpassword" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("should have proper accessibility attributes", () => {
    render(<PasswordInput placeholder="Enter password" />);
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");
    expect(toggleButton).toHaveAttribute("type", "button");
  });

  it("should not submit form when toggle button is clicked", () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());
    const { container } = render(
      <form onSubmit={handleSubmit}>
        <PasswordInput placeholder="Enter password" />
      </form>
    );
    
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    fireEvent.click(toggleButton);
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("should accept additional className props", () => {
    render(<PasswordInput className="custom-class" placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");
    expect(input.className).toContain("custom-class");
  });

  it("should forward ref correctly", () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} placeholder="Enter password" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("should display Eye icon when password is hidden", () => {
    const { container } = render(<PasswordInput />);
    const eyeIcon = container.querySelector('svg');
    expect(eyeIcon).toBeInTheDocument();
  });

  it("should switch to EyeOff icon when password is visible", () => {
    render(<PasswordInput placeholder="Enter password" />);
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    
    fireEvent.click(toggleButton);
    
    const hideButton = screen.getByRole("button", { name: /hide password/i });
    expect(hideButton).toBeInTheDocument();
  });

  it("should support all standard input attributes", () => {
    render(
      <PasswordInput
        placeholder="Enter password"
        disabled
        required
        name="password"
        id="test-password"
      />
    );
    const input = screen.getByPlaceholderText("Enter password");
    
    expect(input).toHaveAttribute("disabled");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("name", "password");
    expect(input).toHaveAttribute("id", "test-password");
  });
});

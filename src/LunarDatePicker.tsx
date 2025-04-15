
import React from 'react';
import './lunarDatePickerStyle.scss';
import { SolarDate } from '@nghiavuive/lunar_date_vi';
import { CalendarIcon } from './icons/CalendarIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import dayjs from 'dayjs';
import { ArrowRightLight } from './icons/ArrowRightLight';
import { ArrowLeftLight } from './icons/ArrowLeftLight';
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat);

interface Props {
	value?: Date;
	onChange?: (date: Date) => void;
	placeHolder?: string;
	valueFormat?: string;
	showLunarDate?: boolean;
	lunarFormat?: 'name' | 'number';
	showToday?: boolean;
	locale?: string;
	localeOptions?: Intl.DateTimeFormatOptions;
	calendarIcon?: React.ReactNode;
	label?: string;
	inputName?: string;
	required?: boolean;
	maxDate?: Date;
	minDate?: Date;
}

const formatDate = (date: Date, valueFormat: string, locale: string) => {
	dayjs.locale(locale)
	return dayjs(date).format(valueFormat);
};

const LunarDatePicker: React.FC<Props> = ({
	value,
	onChange,
	valueFormat = 'DD/MM/YYYY',
	placeHolder,
	showLunarDate = true,
	lunarFormat = 'number',
	showToday = true,
	locale = 'vi',
	localeOptions = { weekday: 'narrow', month: 'long', year: 'numeric' },
	calendarIcon = <CalendarIcon />,
	label = 'Date',
	inputName = 'date',
	required = true,
	maxDate = dayjs().add(5,'day').toDate(),
	minDate = new Date()
}) => {
	const [selectedDate, setSelectedDate] = React.useState<Date>(value || new Date());
	const [showCalendar, setShowCalendar] = React.useState(false);
	const [currentMonth, setCurrentMonth] = React.useState(new Date());
	const [inputValue, setInputValue] = React.useState(
		formatDate(selectedDate, valueFormat, locale)
	);
	const [previousValidValue, setPreviousValidValue] = React.useState(
		formatDate(selectedDate, valueFormat, locale)
	);
	const popupRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popupRef.current && 
				!popupRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setShowCalendar(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const isDateInRange = (date: Date) => {
		if (minDate && date < minDate) return false;
		if (maxDate && date > maxDate) return false;
		return true;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		const parsedDate = dayjs(value, valueFormat, locale);
		
		if (parsedDate.isValid()) {
			const date = parsedDate.toDate();
			if (isDateInRange(date)) {
				setSelectedDate(date);
				setCurrentMonth(date);
				setPreviousValidValue(value);
				onChange?.(date);
			} else {
				setInputValue(previousValidValue);
			}
		}
	};

	const handleDateSelect = (date: Date) => {
		if (!isDateInRange(date)) return;
		
		const formattedDate = formatDate(date, valueFormat, locale);
		setSelectedDate(date);
		setInputValue(formattedDate);
		setPreviousValidValue(formattedDate);
		setShowCalendar(false);
		onChange?.(date);
	};

	const handleBlur = () => {
		if (!dayjs(inputValue , valueFormat, true).isValid()) {
			setInputValue(previousValidValue);
		}
	};

	const handleClear = () => {
		setInputValue('');
		setSelectedDate(new Date());
		setPreviousValidValue('');
		onChange?.(new Date());
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			setShowCalendar(false);
			if (!dayjs(inputValue, valueFormat).isValid()) {
				setInputValue(previousValidValue);
			}
		}
	};

	const renderCalendar = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const today = new Date();
		const days = [];

		// Add weekday names with locale support
		const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((_, index) => {
			const date = new Date(2024, 0, index + 1); // Using a fixed date for weekday names
			return date.toLocaleString(locale, { weekday: localeOptions?.weekday });
		});

		const weekdayElements = weekdays.map((day, index) => (
			<div
				key={day}
				className={`weekday ${index === 6 ? 'sunday' : ''}`}>
				{day}
			</div>
		));

		// Add empty cells for days before the first day of the month
		const firstDayOfWeek = firstDay.getDay() || 7; // Convert Sunday (0) to 7
		for (let i = 1; i < firstDayOfWeek; i++) {
			days.push(
				<div
					key={`empty-${i}`}
					className='calendar-day empty'></div>
			);
		}

		// Add days of the month
		for (let i = 1; i <= lastDay.getDate(); i++) {
			const date = new Date(year, month, i);
			const lunarDate = new SolarDate(date).toLunarDate();
			const isSunday = date.getDay() === 0;
			const isToday = showToday && date.toDateString() === today.toDateString();
			const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
			const isFirstDayOfMonth = lunarDate.get().day === 1;
			const isDisabled = !isDateInRange(date);

			days.push(
				<div
					key={i}
					className={`calendar-day ${isSunday ? 'sunday' : ''} ${
						isToday ? 'today' : ''
					} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
					onClick={() => !isDisabled && handleDateSelect(date)}>
					<div className='solar-date'>{i}</div>
					{showLunarDate && (
						<div className='lunar-date'>
							{lunarFormat === 'number'
								? isFirstDayOfMonth
									? `${lunarDate.get().day}/${lunarDate.get().month}`
									: lunarDate.get().day
								: isFirstDayOfMonth
									? `${lunarDate.getDayName()} ${lunarDate.getMonthName()}`
									: lunarDate.getDayName()}
						</div>
					)}
				</div>
			);
		}
		return (
			<>
				<div className='weekdays'>{weekdayElements}</div>
				<div className='calendar-grid'>{days}</div>
			</>
		);
	};

	return (
		<div className='lunar-date-picker'>
			{label && (
				<label htmlFor={inputName} className="date-picker-label">
					{label}
					{required && <span className="required">*</span>}
				</label>
			)}
			<div className='date-input-container'>
				<input
					ref={inputRef}
					type='text'
					id={inputName}
					name={inputName}
					value={inputValue}
					onChange={handleInputChange}
					onFocus={() => setShowCalendar(true)}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					className={`date-input ${showCalendar ? 'active' : ''} ${required && !inputValue ? 'required' : ''}`}
					placeholder={placeHolder || valueFormat}
					required={required}
				/>
				{inputValue && (
					<button
						className='clear-button'
						onClick={handleClear}
						type='button'
						aria-label='Clear date'
					>
						×
					</button>
				)}
				<div
					className='calendar-icon'
					onClick={() => setShowCalendar(!showCalendar)}
					role='button'
					aria-expanded={showCalendar}
					aria-haspopup='dialog'
					aria-label='Select date'
					tabIndex={0}>
					{calendarIcon}
				</div>
			</div>
			<div
				ref={popupRef}
				className={`calendar-popup ${showCalendar ? 'show' : ''}`}
				role='dialog'
				aria-modal='true'
				aria-label='Calendar'>
				<div className='calendar-header'>
					<div>
						<button
							onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth()))}
						>
							<ArrowLeftIcon style={{ width: '20px', height: '20px' }} />
						</button>
						<button
							onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
						>
							<ArrowLeftLight style={{ width: '20px', height: '20px' }} />
						</button>
					</div>

					<span>
						{currentMonth.toLocaleString(locale, {
							month: 'long',
							year: 'numeric'
						})}
					</span>

					<div>
						<button
							onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
						>
							<ArrowRightLight style={{ width: '20px', height: '20px' }} />
						</button>
						<button
							onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth()))}
						>
							<ArrowRightIcon style={{ width: '20px', height: '20px' }} />
						</button>
					</div>
				</div>
				{renderCalendar()}
			</div>
		</div>
	);
};

export default LunarDatePicker;

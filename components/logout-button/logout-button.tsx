import { IoLogOutOutline } from 'react-icons/io5';
import { logoutAction } from '@/actions/auth/auth';
import { Button } from '@/components/button/button';

export default function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <form action={logoutAction}>
      <Button
        variant="ghost"
        size="sm"
        type="submit"
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className={iconOnly ? 'w-full justify-center px-0' : 'w-full justify-start'}
      >
        <IoLogOutOutline aria-hidden size={18} />
        {!iconOnly && 'Cerrar sesión'}
      </Button>
    </form>
  );
}
